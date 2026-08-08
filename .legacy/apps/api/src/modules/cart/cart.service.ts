import prisma from '../../db/client';
import { NotFoundError, ValidationError, ForbiddenError } from '../../utils/errors';
import { ProductsService } from '../products/products.service';

export class CartService {
  static async getCart(customerId: string) {
    let cart = await prisma.cart.findUnique({
      where: { customerId },
      include: {
        items: {
          include: {
            product: {
              include: {
                priceRules: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { customerId },
        include: {
          items: {
            include: {
              product: {
                include: { priceRules: true },
              },
            },
          },
        },
      });
    }

    // Calculate totals for cart items
    let cartSubtotalPaise = 0;
    let cartDepositTotalPaise = 0;

    const formattedItems = cart.items.map((item) => {
      const durationMs = new Date(item.endDate).getTime() - new Date(item.startDate).getTime();
      const durationDays = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)));

      // Find daily rate rule or fallback
      const dayRule = item.product.priceRules.find((r) => r.durationUnit === 'DAY') || item.product.priceRules[0];
      const dailyRatePaise = dayRule ? dayRule.ratePaise : 10000; // default 100 INR if unconfigured

      const itemRentalPaise = dailyRatePaise * durationDays * item.quantity;
      const itemDepositPaise = item.product.depositAmountPaise * item.quantity;

      cartSubtotalPaise += itemRentalPaise;
      cartDepositTotalPaise += itemDepositPaise;

      return {
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productImage: item.product.imageUrls[0] || null,
        quantity: item.quantity,
        startDate: item.startDate,
        endDate: item.endDate,
        durationDays,
        unitPricePaise: dailyRatePaise,
        totalRentalPaise: itemRentalPaise,
        depositAmountPaise: itemDepositPaise,
      };
    });

    return {
      cartId: cart.id,
      items: formattedItems,
      summary: {
        itemCount: formattedItems.length,
        subtotalPaise: cartSubtotalPaise,
        depositTotalPaise: cartDepositTotalPaise,
        totalPaise: cartSubtotalPaise + cartDepositTotalPaise,
      },
    };
  }

  static async addItem(customerId: string, productId: string, quantity: number, startDateStr: string, endDateStr: string) {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (startDate >= endDate) {
      throw new ValidationError('Start date must be before end date');
    }

    // Check product server-side availability
    const availability = await ProductsService.checkAvailability(productId, startDateStr, endDateStr, quantity);
    if (!availability.isAvailable) {
      throw new ValidationError(
        `Only ${availability.availableUnits} units available for the selected dates. Requested: ${quantity}`,
      );
    }

    let cart = await prisma.cart.findUnique({ where: { customerId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { customerId } });
    }

    const item = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
        startDate,
        endDate,
      },
    });

    return item;
  }

  static async updateItem(customerId: string, itemId: string, data: { quantity?: number; startDate?: string; endDate?: string }) {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!cartItem) {
      throw new NotFoundError('Cart Item', itemId);
    }

    if (cartItem.cart.customerId !== customerId) {
      throw new ForbiddenError('Access denied');
    }

    const newStartDate = data.startDate ? new Date(data.startDate) : cartItem.startDate;
    const newEndDate = data.endDate ? new Date(data.endDate) : cartItem.endDate;
    const newQty = data.quantity || cartItem.quantity;

    if (newStartDate >= newEndDate) {
      throw new ValidationError('Start date must be before end date');
    }

    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: {
        quantity: newQty,
        startDate: newStartDate,
        endDate: newEndDate,
      },
    });

    return updated;
  }

  static async removeItem(customerId: string, itemId: string) {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!cartItem) {
      throw new NotFoundError('Cart Item', itemId);
    }

    if (cartItem.cart.customerId !== customerId) {
      throw new ForbiddenError('Access denied');
    }

    await prisma.cartItem.delete({ where: { id: itemId } });
    return { message: 'Item removed from cart' };
  }

  static async clearCart(customerId: string) {
    const cart = await prisma.cart.findUnique({ where: { customerId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    return { message: 'Cart cleared' };
  }
}
