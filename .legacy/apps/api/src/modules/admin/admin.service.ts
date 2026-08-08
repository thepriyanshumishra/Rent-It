import { RentalStatus, InventoryStatus, ProductStatus } from '@prisma/client';
import prisma from '../../db/client';
import { NotFoundError } from '../../utils/errors';
import { paginate } from '../../utils/response';

export class AdminService {
  static async getDashboardMetrics() {
    const [
      activeCount,
      overdueCount,
      pendingReturnCount,
      pendingSettlementCount,
      totalRentals,
      availableInventoryCount,
      totalInventoryCount,
      revenueResult,
      depositsResult,
    ] = await Promise.all([
      prisma.rental.count({ where: { status: RentalStatus.ACTIVE } }),
      prisma.rental.count({ where: { status: RentalStatus.OVERDUE } }),
      prisma.rental.count({ where: { status: { in: [RentalStatus.ACTIVE, RentalStatus.OVERDUE] } } }),
      prisma.rental.count({ where: { status: RentalStatus.PENDING_SETTLEMENT } }),
      prisma.rental.count(),
      prisma.inventoryItem.count({ where: { status: InventoryStatus.AVAILABLE } }),
      prisma.inventoryItem.count(),
      prisma.payment.aggregate({
        where: { status: 'SUCCEEDED' },
        _sum: { amountPaise: true },
      }),
      prisma.securityDeposit.aggregate({
        where: { status: 'HELD' },
        _sum: { amountPaise: true },
      }),
    ]);

    const totalRevenuePaise = revenueResult._sum.amountPaise || 0;
    const totalDepositsHeldPaise = depositsResult._sum.amountPaise || 0;

    // Recent activity log
    const recentRentals = await prisma.rental.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    });

    return {
      metrics: {
        activeRentals: activeCount,
        overdueRentals: overdueCount,
        pendingReturns: pendingReturnCount,
        pendingSettlements: pendingSettlementCount,
        totalRentals,
        availableInventoryUnits: availableInventoryCount,
        totalInventoryUnits: totalInventoryCount,
        revenueTotalPaise: totalRevenuePaise,
        depositsHeldPaise: totalDepositsHeldPaise,
      },
      recentRentals,
    };
  }

  static async getInventory(query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 15;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.productId) where.productId = query.productId;
    if (query.search) {
      where.OR = [
        { serialNumber: { contains: query.search, mode: 'insensitive' } },
        { product: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.inventoryItem.count({ where }),
      prisma.inventoryItem.findMany({
        where,
        skip,
        take: limit,
        include: {
          product: { select: { id: true, name: true, category: { select: { name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { items, pagination: paginate(total, page, limit) };
  }

  static async createInventoryItem(data: { productId: string; serialNumber?: string; condition?: string; notes?: string }) {
    const product = await prisma.product.findUnique({ where: { id: data.productId } });
    if (!product) throw new NotFoundError('Product', data.productId);

    return prisma.inventoryItem.create({
      data: {
        productId: data.productId,
        serialNumber: data.serialNumber || `SN-${Date.now().toString().slice(-6)}`,
        condition: data.condition || 'New / Good',
        notes: data.notes,
        status: InventoryStatus.AVAILABLE,
      },
      include: { product: true },
    });
  }

  static async updateInventoryStatus(id: string, status: InventoryStatus, condition?: string) {
    const item = await prisma.inventoryItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundError('Inventory Item', id);

    return prisma.inventoryItem.update({
      where: { id },
      data: {
        status,
        condition: condition || item.condition,
      },
    });
  }

  static async getRepairs(query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status;

    const [total, repairs] = await Promise.all([
      prisma.repair.count({ where }),
      prisma.repair.findMany({
        where,
        skip,
        take: limit,
        include: {
          inventoryItem: {
            include: { product: { select: { name: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { repairs, pagination: paginate(total, page, limit) };
  }

  static async updateRepair(id: string, data: { status?: any; notes?: string; estimatedCostPaise?: number }) {
    const repair = await prisma.repair.findUnique({ where: { id } });
    if (!repair) throw new NotFoundError('Repair', id);

    const updated = await prisma.repair.update({
      where: { id },
      data: {
        status: data.status || repair.status,
        notes: data.notes || repair.notes,
        estimatedCostPaise: data.estimatedCostPaise !== undefined ? data.estimatedCostPaise : repair.estimatedCostPaise,
        completedAt: data.status === 'COMPLETED' ? new Date() : repair.completedAt,
      },
    });

    // If repair completed, restore inventory item status to AVAILABLE
    if (data.status === 'COMPLETED') {
      await prisma.inventoryItem.update({
        where: { id: repair.inventoryItemId },
        data: { status: InventoryStatus.AVAILABLE, condition: 'Repaired / Good' },
      });
    }

    return updated;
  }

  static async createProduct(data: any) {
    const category = await prisma.productCategory.findUnique({ where: { id: data.categoryId } });
    if (!category) throw new NotFoundError('Category', data.categoryId);

    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + `-${Date.now().toString().slice(-4)}`;

    return prisma.product.create({
      data: {
        categoryId: data.categoryId,
        name: data.name,
        slug,
        description: data.description,
        shortDesc: data.shortDesc,
        status: data.status || ProductStatus.ACTIVE,
        depositAmountPaise: data.depositAmountPaise || 0,
        imageUrls: data.imageUrls || [],
        attributes: data.attributes ? { create: data.attributes } : undefined,
        priceRules: data.priceRules ? { create: data.priceRules } : undefined,
      },
      include: {
        category: true,
        attributes: true,
        priceRules: true,
      },
    });
  }
}
