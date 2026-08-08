import { ProductStatus, RentalStatus, InventoryStatus } from '@prisma/client';
import prisma from '../../db/client';
import { NotFoundError, ValidationError } from '../../utils/errors';
import { paginate } from '../../utils/response';

export class ProductsService {
  static async getProducts(query: {
    page?: number;
    limit?: number;
    categoryId?: string;
    search?: string;
    status?: ProductStatus;
    minPrice?: number;
    maxPrice?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 12;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status) {
      where.status = query.status;
    } else {
      where.status = ProductStatus.ACTIVE;
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          attributes: true,
          priceRules: true,
          inventoryItems: {
            select: { id: true, status: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Compute total & available count for each product
    const formatted = products.map((p) => {
      const totalInventory = p.inventoryItems.filter(
        (i) => i.status !== InventoryStatus.RETIRED && i.status !== InventoryStatus.UNAVAILABLE,
      ).length;

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        shortDesc: p.shortDesc,
        status: p.status,
        depositAmountPaise: p.depositAmountPaise,
        imageUrls: p.imageUrls,
        category: p.category,
        attributes: p.attributes,
        priceRules: p.priceRules,
        totalInventory,
      };
    });

    return {
      products: formatted,
      pagination: paginate(total, page, limit),
    };
  }

  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        attributes: true,
        priceRules: true,
        inventoryItems: {
          where: {
            status: { notIn: [InventoryStatus.RETIRED, InventoryStatus.UNAVAILABLE] },
          },
          select: { id: true, status: true, condition: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundError('Product', id);
    }

    return product;
  }

  static async getCategories() {
    return prisma.productCategory.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  static async checkAvailability(productId: string, startDateStr: string, endDateStr: string, requestedQty = 1) {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new ValidationError('Invalid start or end date format');
    }

    if (startDate >= endDate) {
      throw new ValidationError('Start date must be before end date');
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        inventoryItems: {
          where: {
            status: { in: [InventoryStatus.AVAILABLE, InventoryStatus.RESERVED] },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundError('Product', productId);
    }

    const totalUsableUnits = product.inventoryItems.length;

    // Find all active commitments during this period
    const overlappingRentalsCount = await prisma.rentalItem.count({
      where: {
        productId,
        rental: {
          status: {
            in: [
              RentalStatus.CONFIRMED,
              RentalStatus.SCHEDULED,
              RentalStatus.ACTIVE,
              RentalStatus.OVERDUE,
              RentalStatus.PENDING_CONFIRMATION,
            ],
          },
          startDate: { lt: endDate },
          endDate: { gt: startDate },
        },
      },
    });

    const availableUnits = Math.max(0, totalUsableUnits - overlappingRentalsCount);
    const isAvailable = availableUnits >= requestedQty;

    return {
      productId,
      productName: product.name,
      totalUnits: totalUsableUnits,
      occupiedUnits: overlappingRentalsCount,
      availableUnits,
      requestedQty,
      isAvailable,
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    };
  }
}
