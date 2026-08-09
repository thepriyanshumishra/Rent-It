from django.db import transaction
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import Cart, CartItem, RentalOrder, RentalOrderItem, LateFeeConfig
from .serializers import (
    CartSerializer, CartItemSerializer,
    RentalOrderSerializer, RentalOrderItemSerializer,
    LateFeeConfigSerializer,
)
from apps.accounts.models import User
from apps.products.models import Product


def _notify(user, message, notification_type='GENERAL', order=None):
    """Fire-and-forget: create an in-app Notification for a user."""
    try:
        from apps.notifications.models import Notification
        Notification.objects.create(
            user=user,
            message=message,
            notification_type=notification_type,
            order=order,
        )
    except Exception:
        pass  # never let notification failure break the main flow


# ──────────────────────────────────────────────────────────
# CART
# ──────────────────────────────────────────────────────────

class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        return Response(CartSerializer(cart).data)


class CartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id')
        quantity   = int(request.data.get('quantity', 1))
        start_date = request.data.get('start_date') or None
        end_date   = request.data.get('end_date')   or None

        # Validate product exists
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check availability
        if product.available_quantity < quantity:
            return Response(
                {'detail': f'Only {product.available_quantity} unit(s) available.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Same product + same dates → merge; else create new line item
        item = CartItem.objects.filter(
            cart=cart, product_id=product.id, start_date=start_date, end_date=end_date
        ).first()

        if item:
            item.quantity += quantity
            item.save()
        else:
            item = CartItem.objects.create(
                cart=cart,
                product=product,
                quantity=quantity,
                start_date=start_date,
                end_date=end_date,
            )
        return Response(CartItemSerializer(item).data, status=status.HTTP_201_CREATED)


class CartItemDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        try:
            item = CartItem.objects.get(pk=pk, cart=cart)
        except CartItem.DoesNotExist:
            return Response({'detail': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = CartItemSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        try:
            item = CartItem.objects.get(pk=pk, cart=cart)
            item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except CartItem.DoesNotExist:
            return Response({'detail': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)


class ClearCartView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart.items.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ──────────────────────────────────────────────────────────
# RENTAL ORDERS
# ──────────────────────────────────────────────────────────

class RentalOrderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = RentalOrderSerializer
    queryset = RentalOrder.objects.all()
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or getattr(user, 'role', None) == User.Role.ADMIN:
            return RentalOrder.objects.all().order_by('-created_at')
        elif getattr(user, 'role', None) == User.Role.STAFF:
            managed_store_ids = user.managed_stores.values_list('id', flat=True)
            if managed_store_ids.exists():
                return RentalOrder.objects.filter(store_id__in=managed_store_ids).order_by('-created_at')
            return RentalOrder.objects.all().order_by('-created_at')
        return RentalOrder.objects.filter(user=user).order_by('-created_at')

    # ── CHECKOUT ──────────────────────────────────────────
    @action(detail=False, methods=['post'], url_path='checkout')
    def checkout(self, request):
        from apps.stores.models import Store, StoreProductStock

        user = request.user
        items_payload = request.data.get('items', [])
        store_id = request.data.get('store_id') or request.data.get('store')
        pickup_slot = request.data.get('pickup_slot', RentalOrder.PickupSlot.MORNING_10_1)
        delivery_method = request.data.get('delivery_method', RentalOrder.DeliveryMethod.STORE_PICKUP)
        delivery_address = request.data.get('delivery_address', '')
        delivery_pincode = request.data.get('delivery_pincode', '')
        total_amount = float(request.data.get('total_amount', 0))

        if not items_payload:
            return Response(
                {'detail': 'No items provided for checkout.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        store_obj = None
        if store_id:
            try:
                store_obj = Store.objects.get(id=store_id)
            except Store.DoesNotExist:
                pass

        # Determine order-level start/end from items
        order_start = None
        order_end = None
        total_deposit = 0.0
        calc_rental = 0.0

        with transaction.atomic():
            # Validate all items first (fail fast)
            validated = []
            for item_data in items_payload:
                prod_id = (
                    item_data.get('product_id') or
                    (item_data.get('product', {}).get('id') if isinstance(item_data.get('product'), dict) else None)
                )
                qty = int(item_data.get('quantity', 1))
                start_date = item_data.get('startDate') or item_data.get('start_date') or None
                end_date   = item_data.get('endDate')   or item_data.get('end_date')   or None

                if not prod_id:
                    continue
                try:
                    prod = Product.objects.select_for_update().get(id=prod_id)
                except Product.DoesNotExist:
                    return Response(
                        {'detail': f'Product {prod_id} not found.'},
                        status=status.HTTP_404_NOT_FOUND
                    )

                # If store is specified, check store stock
                if store_obj:
                    store_stock, _ = StoreProductStock.objects.get_or_create(
                        store=store_obj, product=prod,
                        defaults={'total_quantity': prod.quantity, 'available_quantity': prod.available_quantity}
                    )
                    if store_stock.available_quantity < qty:
                        return Response(
                            {'detail': f'"{prod.name}" only has {store_stock.available_quantity} unit(s) available at {store_obj.name}.'},
                            status=status.HTTP_400_BAD_REQUEST
                        )

                if prod.available_quantity < qty:
                    return Response(
                        {'detail': f'"{prod.name}" only has {prod.available_quantity} unit(s) available.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                validated.append({
                    'prod': prod, 'qty': qty,
                    'start_date': start_date, 'end_date': end_date
                })

            if not validated:
                return Response({'detail': 'No valid items.'}, status=status.HTTP_400_BAD_REQUEST)

            # Calculate totals
            for v in validated:
                prod = v['prod']
                qty  = v['qty']
                days = 1
                if v['start_date'] and v['end_date']:
                    from datetime import date
                    try:
                        s = date.fromisoformat(v['start_date'])
                        e = date.fromisoformat(v['end_date'])
                        days = max(1, (e - s).days)
                        if order_start is None or s < order_start:
                            order_start = s
                        if order_end is None or e > order_end:
                            order_end = e
                    except ValueError:
                        pass
                calc_rental  += float(prod.price or 0) * qty * days
                total_deposit += float(prod.security_deposit or 0) * qty

            final_total = total_amount if total_amount > 0 else (calc_rental + total_deposit)

            # Create order
            order = RentalOrder.objects.create(
                user=user,
                store=store_obj,
                status=RentalOrder.Status.RESERVED,
                pickup_slot=pickup_slot,
                delivery_method=delivery_method,
                delivery_address=delivery_address,
                delivery_pincode=delivery_pincode,
                total_amount=final_total,
                deposit_amount=total_deposit,
                payment_status=RentalOrder.PaymentStatus.PAID,   # simulated
                deposit_status=RentalOrder.DepositStatus.HELD,
                rental_start_date=order_start,
                rental_end_date=order_end,
            )

            # Create items + deduct inventory
            for v in validated:
                prod = v['prod']
                qty  = v['qty']
                days = 1
                if v['start_date'] and v['end_date']:
                    from datetime import date
                    try:
                        s = date.fromisoformat(v['start_date'])
                        e = date.fromisoformat(v['end_date'])
                        days = max(1, (e - s).days)
                    except ValueError:
                        pass

                RentalOrderItem.objects.create(
                    order=order,
                    product=prod,
                    product_name=prod.name,
                    quantity=qty,
                    price=float(prod.price or 0) * days,
                    deposit=float(prod.security_deposit or 0),
                    start_date=v['start_date'],
                    end_date=v['end_date'],
                )
                prod.available_quantity = max(0, prod.available_quantity - qty)
                prod.save()

                if store_obj:
                    store_stock = StoreProductStock.objects.filter(store=store_obj, product=prod).first()
                    if store_stock:
                        store_stock.available_quantity = max(0, store_stock.available_quantity - qty)
                        store_stock.reserved_quantity  += qty
                        store_stock.save()

            # Clear backend cart
            Cart.objects.filter(user=user).delete()

            # ── Notify customer ────────────────────────────────
            _notify(
                user,
                f"✅ Booking confirmed! Order {order.order_number} is reserved. "
                f"Your pickup code is {order.pickup_code}.",
                notification_type='ORDER_CONFIRMED',
                order=order,
            )

        return Response(RentalOrderSerializer(order).data, status=status.HTTP_201_CREATED)

    # ── PICKUP CONFIRM ────────────────────────────────────
    @action(detail=True, methods=['post'], url_path='pickup-confirm')
    def pickup_confirm(self, request, pk=None):
        order = self.get_object()
        code = request.data.get('pickup_code')
        if code and order.pickup_code and code.strip().upper() != order.pickup_code.strip().upper():
            return Response(
                {'detail': 'Invalid pickup verification code.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if order.status not in (RentalOrder.Status.RESERVED, RentalOrder.Status.QUOTATION_SENT):
            return Response(
                {'detail': f'Cannot confirm pickup from status "{order.status}".'},
                status=status.HTTP_400_BAD_REQUEST
            )
        order.status = RentalOrder.Status.PICKED_UP
        order.picked_up_at = timezone.now()
        order.save()
        _notify(
            order.user,
            f"📦 Equipment picked up for order {order.order_number}. "
            f"Rental period starts now. Return by {order.rental_end_date}.",
            notification_type='EQUIPMENT_OUT',
            order=order,
        )
        return Response(RentalOrderSerializer(order).data)

    # ── PROCESS RETURN ────────────────────────────────────
    @action(detail=True, methods=['post'], url_path='process-return')
    def process_return(self, request, pk=None):
        from apps.stores.models import StoreProductStock

        order = self.get_object()
        if order.status not in (
            RentalOrder.Status.PICKED_UP,
            RentalOrder.Status.LATE_RETURN,
            'ACTIVE',
        ):
            return Response(
                {'detail': f'Cannot process return from status "{order.status}".'},
                status=status.HTTP_400_BAD_REQUEST
            )

        condition     = request.data.get('condition_on_return', RentalOrder.ConditionOnReturn.GOOD)
        notes         = request.data.get('inspection_notes', '')
        returned_now  = timezone.now()

        # Calculate late fee
        late_fee  = 0
        late_days = 0
        if order.rental_end_date:
            today = returned_now.date()
            if today > order.rental_end_date:
                late_days = (today - order.rental_end_date).days
                config = LateFeeConfig.get_config()
                if config.is_active and late_days > 0:
                    late_fee = min(
                        late_days * float(config.per_day_rate),
                        float(config.max_fee_cap)
                    )

        with transaction.atomic():
            order.status             = RentalOrder.Status.RETURNED
            order.returned_at        = returned_now
            order.condition_on_return = condition
            order.inspection_notes   = notes
            order.late_fee_amount    = late_fee
            order.late_fee_days      = late_days
            order.save()

            # Restore inventory
            for item in order.items.all():
                try:
                    prod = item.product
                    if not prod:
                        continue
                    prod.available_quantity += item.quantity
                    prod.save()

                    if order.store:
                        st_stock = StoreProductStock.objects.filter(
                            store=order.store, product=prod
                        ).first()
                        if st_stock:
                            st_stock.available_quantity += item.quantity
                            st_stock.reserved_quantity  = max(0, st_stock.reserved_quantity - item.quantity)
                            st_stock.save()
                except Exception:
                    pass

        _notify(
            order.user,
            f"✅ Equipment returned for order {order.order_number}. "
            + (f"Late fee of ₹{late_fee:.0f} applied." if late_fee > 0
               else "No late fees. Deposit will be refunded shortly."),
            notification_type='ORDER_RETURNED',
            order=order,
        )
        return Response(RentalOrderSerializer(order).data)

    # ── SETTLE DEPOSIT ────────────────────────────────────
    @action(detail=True, methods=['post'], url_path='settle-deposit')
    def settle_deposit(self, request, pk=None):
        order = self.get_object()
        if order.status != RentalOrder.Status.RETURNED:
            return Response(
                {'detail': 'Can only settle deposit after return is processed.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if order.deposit_status in (
            RentalOrder.DepositStatus.REFUNDED,
            RentalOrder.DepositStatus.PARTIALLY_REFUNDED,
            RentalOrder.DepositStatus.SETTLED,
        ):
            return Response(
                {'detail': 'Deposit has already been settled.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        late_fee   = float(order.late_fee_amount or 0)
        deposit    = float(order.deposit_amount or 0)
        refund_amt = max(0, deposit - late_fee)

        if late_fee >= deposit:
            order.deposit_status = RentalOrder.DepositStatus.SETTLED
        elif late_fee > 0:
            order.deposit_status = RentalOrder.DepositStatus.PARTIALLY_REFUNDED
        else:
            order.deposit_status = RentalOrder.DepositStatus.REFUNDED

        order.save()

        return Response({
            'detail': 'Deposit settled successfully.',
            'deposit_amount': deposit,
            'late_fee_deducted': late_fee,
            'refund_amount': refund_amt,
            'deposit_status': order.deposit_status,
            'order': RentalOrderSerializer(order).data
        })

    # ── CANCEL ────────────────────────────────────────────
    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel(self, request, pk=None):
        order = self.get_object()
        cancellable = (
            RentalOrder.Status.QUOTATION,
            RentalOrder.Status.QUOTATION_SENT,
            RentalOrder.Status.RESERVED,
        )
        if order.status not in cancellable:
            return Response(
                {'detail': f'Cannot cancel order with status "{order.status}".'},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            # Restore inventory for RESERVED orders
            if order.status == RentalOrder.Status.RESERVED:
                for item in order.items.all():
                    try:
                        prod = item.product
                        if prod:
                            prod.available_quantity += item.quantity
                            prod.save()
                    except Exception:
                        pass
            order.status             = RentalOrder.Status.CANCELLED
            order.payment_status     = RentalOrder.PaymentStatus.REFUNDED
            order.deposit_status     = RentalOrder.DepositStatus.REFUNDED
            order.cancelled_at       = timezone.now()
            order.cancellation_reason = request.data.get('reason', '')
            order.save()

        _notify(
            order.user,
            f"❌ Order {order.order_number} has been cancelled. "
            f"Any payment will be refunded within 3–5 business days.",
            notification_type='ORDER_CANCELLED',
            order=order,
        )
        return Response(RentalOrderSerializer(order).data)


# ──────────────────────────────────────────────────────────
# SETTINGS — LATE FEE CONFIG
# ──────────────────────────────────────────────────────────

class LateFeeConfigView(APIView):
    """GET + PUT for singleton late fee config (admin only)."""

    def get_permissions(self):
        return [IsAuthenticated()]

    def get(self, request):
        config = LateFeeConfig.get_config()
        return Response(LateFeeConfigSerializer(config).data)

    def put(self, request):
        if not (request.user.is_superuser or getattr(request.user, 'role', None) in (
            User.Role.ADMIN, User.Role.STAFF
        )):
            return Response({'detail': 'Admin only.'}, status=status.HTTP_403_FORBIDDEN)
        config = LateFeeConfig.get_config()
        serializer = LateFeeConfigSerializer(config, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ──────────────────────────────────────────────────────────
# LEGACY ViewSets (kept for URL compat)
# ──────────────────────────────────────────────────────────

class CartViewSet(viewsets.ModelViewSet):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer


class CartItemViewSet(viewsets.ModelViewSet):
    queryset = CartItem.objects.all()
    serializer_class = CartItemSerializer


class RentalOrderItemViewSet(viewsets.ModelViewSet):
    queryset = RentalOrderItem.objects.all()
    serializer_class = RentalOrderItemSerializer
