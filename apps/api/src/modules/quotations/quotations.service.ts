import { QuotationStatus, Role } from '@prisma/client';
import prisma from '../../db/client';
import { NotFoundError, BusinessRuleError } from '../../utils/errors';
import { RentalsService } from '../rentals/rentals.service';

export class QuotationsService {
  static async createQuotation(user: { userId: string; role: Role; customerId?: string }, data: any) {
    const customerId = data.customerId || user.customerId;
    if (!customerId) throw new BusinessRuleError('Customer ID required for quotation');

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + (data.validUntilDays || 7));

    let totalPaise = 0;
    const itemsData = [];

    for (const item of data.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { priceRules: true },
      });
      if (!product) throw new NotFoundError('Product', item.productId);

      const days = Math.max(1, Math.ceil((new Date(item.endDate).getTime() - new Date(item.startDate).getTime()) / (86400 * 1000)));
      const rule = product.priceRules.find((r) => r.durationUnit === 'DAY') || product.priceRules[0];
      const unitPrice = rule ? rule.ratePaise : 10000;
      const itemTotal = unitPrice * days * item.quantity;

      totalPaise += itemTotal;
      itemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        startDate: new Date(item.startDate),
        endDate: new Date(item.endDate),
        unitPricePaise: unitPrice,
        totalPaise: itemTotal,
      });
    }

    return prisma.quotation.create({
      data: {
        customerId,
        status: QuotationStatus.DRAFT,
        validUntil,
        notes: data.notes,
        totalPaise,
        items: { create: itemsData },
      },
      include: {
        items: { include: { product: true } },
        customer: true,
      },
    });
  }

  static async getQuotations(user: { userId: string; role: Role; customerId?: string }) {
    const where: any = {};
    if (user.role === Role.CUSTOMER) where.customerId = user.customerId;

    return prisma.quotation.findMany({
      where,
      include: {
        items: { include: { product: true } },
        customer: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
