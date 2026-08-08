import uuid, math
from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.utils.dateparse import parse_datetime
from django.db import transaction
from .models import Rental, RentalItem, Cart, CartItem, Payment, SecurityDeposit, Charge, Settlement, Fulfillment, ReturnRecord, InspectionRecord, Damage, RentalStatus, DepositStatus, PaymentStatus, InspectionResult, ChargeType
from catalog.models import Product
from inventory.models import InventoryItem, InventoryStatus, Repair
from .serializers import RentalSerializer

class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        customer = getattr(request.user, 'customer_profile', None)
        if not customer:
            return Response({'success': False, 'error': {'message': 'Customer profile required'}}, status=status.HTTP_403_FORBIDDEN)

        cart, _ = Cart.objects.get_or_create(customer=customer)
        items = CartItem.objects.filter(cart=cart)

        formatted_items = []
        subtotal_paise = 0
        deposit_total_paise = 0

        for item in items:
            duration_days = max(1, math.ceil((item.end_date - item.start_date).total_seconds() / (86400)))
            rule = item.product.price_rules.first()
            day_rate = rule.rate_paise if rule else 10000

            item_rental_paise = day_rate * duration_days * item.quantity
            item_deposit_paise = item.product.deposit_amount_paise * item.quantity

            subtotal_paise += item_rental_paise
            deposit_total_paise += item_deposit_paise

            formatted_items.append({
                'id': str(item.id),
                'productId': str(item.product.id),
                'productName': item.product.name,
                'productImage': item.product.image_url,
                'quantity': item.quantity,
                'startDate': item.start_date.isoformat(),
                'endDate': item.end_date.isoformat(),
                'durationDays': duration_days,
                'unitPricePaise': day_rate,
                'totalRentalPaise': item_rental_paise,
                'depositAmountPaise': item_deposit_paise,
            })

        return Response({
            'success': True,
            'data': {
                'cartId': str(cart.id),
                'items': formatted_items,
                'summary': {
                    'itemCount': len(formatted_items),
                    'subtotalPaise': subtotal_paise,
                    'depositTotalPaise': deposit_total_paise,
                    'totalPaise': subtotal_paise + deposit_total_paise,
                }
            }
        })

    def post(self, request):
        customer = getattr(request.user, 'customer_profile', None)
        if not customer:
            return Response({'success': False, 'error': {'message': 'Customer profile required'}}, status=status.HTTP_403_FORBIDDEN)

        product_id = request.data.get('productId')
        quantity = int(request.data.get('quantity', 1))
        start_date = parse_datetime(request.data.get('startDate'))
        end_date = parse_datetime(request.data.get('endDate'))

        cart, _ = Cart.objects.get_or_create(customer=customer)
        product = Product.objects.get(pk=product_id)

        item = CartItem.objects.create(
            cart=cart,
            product=product,
            quantity=quantity,
            start_date=start_date,
            end_date=end_date
        )

        return Response({'success': True, 'data': {'id': str(item.id)}}, status=status.HTTP_201_CREATED)

class CheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        customer = getattr(request.user, 'customer_profile', None)
        if not customer:
            return Response({'success': False, 'error': {'message': 'Customer profile required'}}, status=status.HTTP_403_FORBIDDEN)

        cart = Cart.objects.get(customer=customer)
        cart_items = CartItem.objects.filter(cart=cart)

        if not cart_items.exists():
            return Response({'success': False, 'error': {'message': 'Cart is empty'}}, status=status.HTTP_400_BAD_REQUEST)

        earliest_start = cart_items.first().start_date
        latest_end = cart_items.first().end_date

        subtotal_paise = 0
        deposit_total_paise = 0

        rental_number = f"RNT-{datetime.now().strftime('%Y%m')}-{Rental.objects.count() + 1001}"

        for item in cart_items:
            days = max(1, math.ceil((item.end_date - item.start_date).total_seconds() / 86400))
            rule = item.product.price_rules.first()
            unit_price = rule.rate_paise if rule else 10000
            total_item = unit_price * days * item.quantity
            deposit_total_paise += (item.product.deposit_amount_paise * item.quantity)
            subtotal_paise += total_item

        total_paise = subtotal_paise + deposit_total_paise

        rental = Rental.objects.create(
            rental_number=rental_number,
            customer=customer,
            status=RentalStatus.PENDING_CONFIRMATION,
            fulfillment_type=request.data.get('fulfillmentType', 'STORE_PICKUP'),
            start_date=earliest_start,
            end_date=latest_end,
            subtotal_paise=subtotal_paise,
            deposit_total_paise=deposit_total_paise,
            total_paise=total_paise,
            notes=request.data.get('notes', '')
        )

        for item in cart_items:
            days = max(1, math.ceil((item.end_date - item.start_date).total_seconds() / 86400))
            rule = item.product.price_rules.first()
            unit_price = rule.rate_paise if rule else 10000
            RentalItem.objects.create(
                rental=rental,
                product=item.product,
                quantity=item.quantity,
                unit_price_paise=unit_price,
                total_paise=unit_price * days * item.quantity
            )

        SecurityDeposit.objects.create(rental=rental, amount_paise=deposit_total_paise, status=DepositStatus.HELD)
        Fulfillment.objects.create(rental=rental, type=request.data.get('fulfillmentType', 'STORE_PICKUP'))

        # Clear cart
        cart_items.delete()

        return Response({'success': True, 'data': RentalSerializer(rental).data}, status=status.HTTP_201_CREATED)

class ConfirmPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        try:
            rental = Rental.objects.get(pk=pk)
        except Rental.DoesNotExist:
            return Response({'success': False, 'error': {'message': 'Rental not found'}}, status=status.HTTP_404_NOT_FOUND)

        Payment.objects.create(
            rental=rental,
            amount_paise=rental.total_paise,
            status=PaymentStatus.SUCCEEDED,
            method='SIMULATED',
            provider_ref=f"SIM_PAY_{uuid.uuid4().hex[:8].upper()}",
            idempotency_key=f"PAY-{rental.id}-{datetime.now().timestamp()}"
        )

        rental.status = RentalStatus.CONFIRMED
        rental.save()

        return Response({'success': True, 'data': RentalSerializer(rental).data})

class RentalListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        queryset = Rental.objects.all()

        if user.role == 'CUSTOMER':
            customer = getattr(user, 'customer_profile', None)
            queryset = queryset.filter(customer=customer)

        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        serializer = RentalSerializer(queryset.order_by('-created_at'), many=True)
        return Response({'success': True, 'data': serializer.data})

class RentalDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            rental = Rental.objects.get(pk=pk)
            return Response({'success': True, 'data': RentalSerializer(rental).data})
        except Rental.DoesNotExist:
            return Response({'success': False, 'error': {'message': 'Rental not found'}}, status=status.HTTP_404_NOT_FOUND)

# Admin Operational Views
class ConfirmPickupView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        rental = Rental.objects.get(pk=pk)
        for item in rental.items.all():
            inv = InventoryItem.objects.filter(product=item.product, status='AVAILABLE').first()
            if inv:
                item.inventory_item = inv
                item.save()
                inv.status = 'RENTED'
                inv.save()

        rental.status = RentalStatus.ACTIVE
        rental.save()
        return Response({'success': True, 'data': RentalSerializer(rental).data})

class ProcessReturnView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        rental = Rental.objects.get(pk=pk)
        ReturnRecord.objects.create(
            rental=rental,
            returned_at=datetime.now(),
            returned_by=request.user,
            notes=request.data.get('notes', '')
        )
        rental.status = RentalStatus.UNDER_INSPECTION
        rental.actual_return_date = datetime.now()
        rental.save()
        return Response({'success': True, 'data': RentalSerializer(rental).data})

class ProcessInspectionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        rental = Rental.objects.get(pk=pk)
        return_rec = rental.return_record
        res = request.data.get('result', 'OK')

        inspection = InspectionRecord.objects.create(
            return_record=return_rec,
            rental=rental,
            result=res,
            notes=request.data.get('notes', ''),
            inspected_by=request.user
        )

        damages = request.data.get('damages', [])
        for d in damages:
            Damage.objects.create(
                inspection=inspection,
                description=d['description'],
                severity=d.get('severity', 'MINOR'),
                charge_amount_paise=d['chargeAmountPaise']
            )
            Charge.objects.create(
                rental=rental,
                type=ChargeType.DAMAGE,
                amount_paise=d['chargeAmountPaise'],
                reason=d['description']
            )

        for item in rental.items.all():
            if item.inventory_item:
                item.inventory_item.status = 'AVAILABLE' if res == 'OK' else 'UNDER_REPAIR'
                item.inventory_item.save()
                if res != 'OK':
                    Repair.objects.create(inventory_item=item.inventory_item, reason=f"Damaged on rental {rental.rental_number}")

        rental.status = RentalStatus.PENDING_SETTLEMENT
        rental.save()
        return Response({'success': True, 'data': RentalSerializer(rental).data})

class SettleRentalView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        rental = Rental.objects.get(pk=pk)
        held_deposit = rental.deposit_total_paise
        charges = sum(c.amount_paise for c in rental.charges.all())

        deducted = min(held_deposit, charges)
        refund = max(0, held_deposit - deducted)

        Settlement.objects.create(
            rental=rental,
            total_charges_paise=charges,
            deposit_deducted_paise=deducted,
            refund_amount_paise=refund,
            status='COMPLETED',
            notes=request.data.get('notes', '')
        )

        rental.status = RentalStatus.COMPLETED
        rental.save()

        dep = rental.deposits.first()
        if dep:
            dep.status = DepositStatus.SETTLED
            dep.settled_at = datetime.now()
            dep.save()

        return Response({'success': True, 'data': RentalSerializer(rental).data})

class AdminDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        active = Rental.objects.filter(status='ACTIVE').count()
        overdue = Rental.objects.filter(status='OVERDUE').count()
        pending_returns = Rental.objects.filter(status__in=['ACTIVE', 'OVERDUE']).count()
        pending_settlements = Rental.objects.filter(status='PENDING_SETTLEMENT').count()
        total_rentals = Rental.objects.count()

        rev = sum(p.amount_paise for p in Payment.objects.filter(status='SUCCEEDED'))
        deposits = sum(d.amount_paise for d in SecurityDeposit.objects.filter(status='HELD'))

        recent = Rental.objects.order_by('-created_at')[:5]

        return Response({
            'success': True,
            'data': {
                'metrics': {
                    'activeRentals': active,
                    'overdueRentals': overdue,
                    'pendingReturns': pending_returns,
                    'pendingSettlements': pending_settlements,
                    'totalRentals': total_rentals,
                    'revenueTotalPaise': rev,
                    'depositsHeldPaise': deposits,
                },
                'recentRentals': RentalSerializer(recent, many=True).data
            }
        })

class RequestReturnView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            rental = Rental.objects.get(pk=pk)
            rental.notes = (rental.notes or '') + f"\n[Return Requested]: {request.data.get('notes', '')}"
            rental.save()
            return Response({'success': True, 'data': RentalSerializer(rental).data})
        except Rental.DoesNotExist:
            return Response({'success': False, 'error': {'message': 'Rental not found'}}, status=status.HTTP_404_NOT_FOUND)

