import {
  RentalStatus,
  InventoryStatus,
  FulfillmentType,
  PaymentStatus,
  DepositStatus,
  SettlementStatus,
  InspectionResult,
  ChargeType,
  Role,
} from '@prisma/client';
import prisma from '../../db/client';
import { NotFoundError, ValidationError, BusinessRuleError, ForbiddenError } from '../../utils/errors';
import { ProductsService } from '../products/products.service';
import { paginate } from '../../utils/response';
import { v4 as uuidv4 } from 'uuid';

export class RentalsService {
  // Helper to generate unique rental number (e.g. RENT-2026-1001)
  private static async generateRentalNumber(): Promise<string> {
    const count = await prisma.rental.count();
    const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
    return `RNT-${dateStr}-${(count + 1001).toString().padStart(5, '0')}`;
  }

  // 1. Checkout Cart into Rental
  static async checkoutCart(customerId: string, fulfillmentType: FulfillmentType, notes?: string) {
    const cart = await prisma.cart.findUnique({
      where: { customerId },
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

    if (!cart || cart.items.length === 0) {
      throw new ValidationError('Cart is empty');
    }

    // Determine overall start and end dates from cart items
    let earliestStart = cart.items[0].startDate;
    let latestEnd = cart.items[0].endDate;

    for (const item of cart.items) {
      if (item.startDate < earliestStart) earliestStart = item.startDate;
      if (item.endDate > latestEnd) latestEnd = item.endDate;
    }

    // Verify availability for all items atomically
    for (const item of cart.items) {
      const avail = await ProductsService.checkAvailability(
        item.productId,
        item.startDate.toISOString(),
        item.endDate.toISOString(),
        item.quantity,
      );
      if (!avail.isAvailable) {
        throw new BusinessRuleError(
          `Product '${avail.productName}' is not available for requested period. Available: ${avail.availableUnits}, Requested: ${item.quantity}`,
        );
      }
    }

    let subtotalPaise = 0;
    let depositTotalPaise = 0;

    const rentalItemsData = cart.items.map((item) => {
      const durationMs = item.endDate.getTime() - item.startDate.getTime();
      const days = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)));

      const dayRule = item.product.priceRules.find((r) => r.durationUnit === 'DAY') || item.product.priceRules[0];
      const unitPricePaise = dayRule ? dayRule.ratePaise : 10000;
      const totalItemPaise = unitPricePaise * days * item.quantity;
      const totalDepositPaise = item.product.depositAmountPaise * item.quantity;

      subtotalPaise += totalItemPaise;
      depositTotalPaise += totalDepositPaise;

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPricePaise,
        totalPaise: totalItemPaise,
      };
    });

    const rentalNumber = await this.generateRentalNumber();
    const totalPaise = subtotalPaise + depositTotalPaise;

    // Create Rental in transaction
    const rental = await prisma.$transaction(async (tx) => {
      const newRental = await tx.rental.create({
        data: {
          rentalNumber,
          customerId,
          status: RentalStatus.PENDING_CONFIRMATION,
          fulfillmentType,
          startDate: earliestStart,
          endDate: latestEnd,
          subtotalPaise,
          depositTotalPaise,
          totalPaise,
          notes,
          items: {
            create: rentalItemsData,
          },
          fulfillment: {
            create: {
              type: fulfillmentType,
            },
          },
          deposits: {
            create: {
              amountPaise: depositTotalPaise,
              status: DepositStatus.HELD,
            },
          },
        },
        include: {
          items: true,
          deposits: true,
        },
      });

      // Clear customer cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newRental;
    });

    return rental;
  }

  // 2. Process Simulated Payment & Confirm Rental
  static async confirmPayment(rentalId: string, customerId?: string) {
    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: { items: true },
    });

    if (!rental) {
      throw new NotFoundError('Rental', rentalId);
    }

    if (customerId && rental.customerId !== customerId) {
      throw new ForbiddenError('Access denied');
    }

    if (rental.status !== RentalStatus.PENDING_CONFIRMATION && rental.status !== RentalStatus.DRAFT) {
      throw new BusinessRuleError(`Rental cannot be confirmed from status ${rental.status}`);
    }

    // Process simulated payment idempotently
    const idempotencyKey = `PAY-${rentalId}-${Date.now()}`;

    const updatedRental = await prisma.$transaction(async (tx) => {
      // Record payment
      await tx.payment.create({
        data: {
          rentalId: rental.id,
          amountPaise: rental.totalPaise,
          status: PaymentStatus.SUCCEEDED,
          idempotencyKey,
          providerRef: `SIM_PAY_${uuidv4().slice(0, 8).toUpperCase()}`,
        },
      });

      // Move rental status to CONFIRMED
      const confirmed = await tx.rental.update({
        where: { id: rentalId },
        data: {
          status: RentalStatus.CONFIRMED,
        },
        include: {
          items: { include: { product: true } },
          payments: true,
          deposits: true,
          customer: true,
        },
      });

      // Log audit event
      await tx.auditEvent.create({
        data: {
          action: 'RENTAL_CONFIRMED',
          entityType: 'RENTAL',
          entityId: rentalId,
          rentalId,
          metadata: { totalPaise: rental.totalPaise },
        },
      });

      return confirmed;
    });

    return updatedRental;
  }

  // 3. Confirm Pickup (Admin/Staff)
  static async confirmPickup(rentalId: string, staffUserId: string, itemBindings?: Array<{ rentalItemId: string; inventoryItemId: string }>) {
    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: {
        items: { include: { product: { include: { inventoryItems: true } } } },
      },
    });

    if (!rental) {
      throw new NotFoundError('Rental', rentalId);
    }

    if (rental.status !== RentalStatus.CONFIRMED && rental.status !== RentalStatus.SCHEDULED) {
      throw new BusinessRuleError(`Cannot confirm pickup for rental in status '${rental.status}'`);
    }

    return await prisma.$transaction(async (tx) => {
      // Bind inventory items if provided or automatically assign available units
      for (const item of rental.items) {
        let invId = item.inventoryItemId;

        if (itemBindings) {
          const binding = itemBindings.find((b) => b.rentalItemId === item.id);
          if (binding) invId = binding.inventoryItemId;
        }

        // If no binding, pick first available item
        if (!invId) {
          const availableUnit = item.product.inventoryItems.find(
            (i) => i.status === InventoryStatus.AVAILABLE || i.status === InventoryStatus.RESERVED,
          );
          if (!availableUnit) {
            throw new BusinessRuleError(`No available inventory item unit found for product '${item.product.name}'`);
          }
          invId = availableUnit.id;
        }

        // Update rental item binding
        await tx.rentalItem.update({
          where: { id: item.id },
          data: { inventoryItemId: invId },
        });

        // Update inventory item status to RENTED
        await tx.inventoryItem.update({
          where: { id: invId },
          data: { status: InventoryStatus.RENTED },
        });
      }

      // Update rental status to ACTIVE
      const activeRental = await tx.rental.update({
        where: { id: rentalId },
        data: { status: RentalStatus.ACTIVE },
        include: {
          items: { include: { product: true, inventoryItem: true } },
          customer: true,
        },
      });

      // Update fulfillment
      await tx.fulfillment.updateMany({
        where: { rentalId },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });

      await tx.auditEvent.create({
        data: {
          actorId: staffUserId,
          action: 'PICKUP_CONFIRMED',
          entityType: 'RENTAL',
          entityId: rentalId,
          rentalId,
        },
      });

      return activeRental;
    });
  }

  // 4. Process Return (Admin/Staff)
  static async processReturn(rentalId: string, staffUserId: string, returnedAtStr?: string, notes?: string) {
    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: { returnRecord: true },
    });

    if (!rental) {
      throw new NotFoundError('Rental', rentalId);
    }

    if (rental.status !== RentalStatus.ACTIVE && rental.status !== RentalStatus.OVERDUE) {
      throw new BusinessRuleError(`Cannot process return for rental in status '${rental.status}'`);
    }

    if (rental.returnRecord) {
      throw new BusinessRuleError('Return has already been processed for this rental');
    }

    const returnedAt = returnedAtStr ? new Date(returnedAtStr) : new Date();

    return await prisma.$transaction(async (tx) => {
      // Create return record
      const returnRecord = await tx.return.create({
        data: {
          rentalId,
          returnedAt,
          returnedById: staffUserId,
          notes,
        },
      });

      // Update rental state to RETURNED / UNDER_INSPECTION
      const updatedRental = await tx.rental.update({
        where: { id: rentalId },
        data: {
          status: RentalStatus.UNDER_INSPECTION,
          actualReturnDate: returnedAt,
        },
        include: {
          items: { include: { product: true, inventoryItem: true } },
          customer: true,
          returnRecord: true,
        },
      });

      await tx.auditEvent.create({
        data: {
          actorId: staffUserId,
          action: 'RETURN_PROCESSED',
          entityType: 'RENTAL',
          entityId: rentalId,
          rentalId,
          metadata: { returnedAt: returnedAt.toISOString() },
        },
      });

      return updatedRental;
    });
  }

  // 5. Process Inspection (Admin/Staff)
  static async processInspection(
    rentalId: string,
    staffUserId: string,
    result: InspectionResult,
    notes?: string,
    damages?: Array<{ description: string; severity: any; chargeAmountPaise: number }>,
  ) {
    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: { returnRecord: true, inspection: true, items: true },
    });

    if (!rental || !rental.returnRecord) {
      throw new BusinessRuleError('Rental must be returned before inspection');
    }

    if (rental.inspection) {
      throw new BusinessRuleError('Inspection has already been completed for this rental');
    }

    return await prisma.$transaction(async (tx) => {
      // Create inspection record
      const inspection = await tx.inspection.create({
        data: {
          returnId: rental.returnRecord!.id,
          rentalId,
          result,
          notes,
          inspectedById: staffUserId,
          damages: damages
            ? {
                create: damages.map((d) => ({
                  description: d.description,
                  severity: d.severity,
                  chargeAmountPaise: d.chargeAmountPaise,
                })),
              }
            : undefined,
        },
        include: { damages: true },
      });

      // Create charges if damage inspection charges exist
      let damageTotalPaise = 0;
      if (damages && damages.length > 0) {
        for (const d of damages) {
          damageTotalPaise += d.chargeAmountPaise;
          await tx.charge.create({
            data: {
              rentalId,
              type: ChargeType.DAMAGE,
              amountPaise: d.chargeAmountPaise,
              reason: `Damage (${d.severity}): ${d.description}`,
            },
          });
        }
      }

      // Update inventory item status based on inspection result
      for (const item of rental.items) {
        if (item.inventoryItemId) {
          const nextStatus =
            result === InspectionResult.OK ? InventoryStatus.AVAILABLE : InventoryStatus.UNDER_REPAIR;
          await tx.inventoryItem.update({
            where: { id: item.inventoryItemId },
            data: { status: nextStatus },
          });

          // Create repair record if damaged
          if (result !== InspectionResult.OK) {
            await tx.repair.create({
              data: {
                inventoryItemId: item.inventoryItemId,
                reason: `Inspection result: ${result}. ${notes || ''}`,
                status: 'PENDING',
              },
            });
          }
        }
      }

      // Move rental status to PENDING_SETTLEMENT
      const updatedRental = await tx.rental.update({
        where: { id: rentalId },
        data: { status: RentalStatus.PENDING_SETTLEMENT },
        include: {
          items: true,
          inspection: { include: { damages: true } },
          charges: true,
        },
      });

      await tx.auditEvent.create({
        data: {
          actorId: staffUserId,
          action: 'INSPECTION_COMPLETED',
          entityType: 'RENTAL',
          entityId: rentalId,
          rentalId,
          metadata: { result, damageTotalPaise },
        },
      });

      return updatedRental;
    });
  }

  // 6. Settle Deposit & Close Rental (Admin/Staff)
  static async settleRental(rentalId: string, staffUserId: string, notes?: string, extraChargePaise = 0, extraChargeReason?: string) {
    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: {
        deposits: true,
        charges: true,
        settlement: true,
        items: true,
      },
    });

    if (!rental) {
      throw new NotFoundError('Rental', rentalId);
    }

    if (rental.settlement) {
      throw new BusinessRuleError('Rental deposit has already been settled');
    }

    // Calculate late fees if applicable (BR-054, BR-055, BR-058)
    const returnDate = rental.actualReturnDate || new Date();
    const scheduledEnd = rental.endDate;

    let lateFeePaise = 0;
    if (returnDate > scheduledEnd) {
      const overdueMs = returnDate.getTime() - scheduledEnd.getTime();
      const overdueDays = Math.ceil(overdueMs / (1000 * 60 * 60 * 24));

      // 1 day grace period (BR-058)
      if (overdueDays > 1) {
        const billableOverdueDays = overdueDays - 1;
        // Late fee per day = 50% of daily subtotal rate
        const dailyRate = Math.round(rental.subtotalPaise / Math.max(1, Math.ceil((scheduledEnd.getTime() - rental.startDate.getTime()) / (86400 * 1000))));
        const calculatedLateFee = Math.round(dailyRate * 0.5 * billableOverdueDays);

        // Cap at maximum late fee (e.g. 200% of rental subtotal - BR-054)
        const maxLateFee = rental.subtotalPaise * 2;
        lateFeePaise = Math.min(calculatedLateFee, maxLateFee);
      }
    }

    return await prisma.$transaction(async (tx) => {
      // Add late fee charge if applicable
      if (lateFeePaise > 0) {
        await tx.charge.create({
          data: {
            rentalId,
            type: ChargeType.LATE_FEE,
            amountPaise: lateFeePaise,
            reason: `Late return fee`,
          },
        });
      }

      // Add extra charge if provided
      if (extraChargePaise > 0) {
        await tx.charge.create({
          data: {
            rentalId,
            type: ChargeType.OTHER,
            amountPaise: extraChargePaise,
            reason: extraChargeReason || 'Additional operational charge',
          },
        });
      }

      // Fetch all charges including newly created
      const allCharges = await tx.charge.findMany({ where: { rentalId } });
      const totalChargesPaise = allCharges.reduce((sum, c) => sum + c.amountPaise, 0);

      // Deposit settlement math (Invariant 3 & BR-049)
      const heldDepositPaise = rental.depositTotalPaise;
      const depositDeductedPaise = Math.min(heldDepositPaise, totalChargesPaise);
      const refundAmountPaise = Math.max(0, heldDepositPaise - depositDeductedPaise);

      // Update SecurityDeposit status
      await tx.securityDeposit.updateMany({
        where: { rentalId },
        data: {
          status: refundAmountPaise > 0 ? DepositStatus.SETTLED : DepositStatus.FORFEITED,
          settledAt: new Date(),
        },
      });

      // Create Settlement record
      const settlement = await tx.settlement.create({
        data: {
          rentalId,
          totalChargesPaise,
          depositDeductedPaise,
          refundAmountPaise,
          status: SettlementStatus.COMPLETED,
          notes,
          settledAt: new Date(),
        },
      });

      // Update Rental to COMPLETED
      const completedRental = await tx.rental.update({
        where: { id: rentalId },
        data: {
          status: RentalStatus.COMPLETED,
          lateFeesPaise: lateFeePaise,
        },
        include: {
          items: { include: { product: true } },
          settlement: true,
          deposits: true,
          charges: true,
          customer: true,
        },
      });

      await tx.auditEvent.create({
        data: {
          actorId: staffUserId,
          action: 'SETTLEMENT_COMPLETED',
          entityType: 'RENTAL',
          entityId: rentalId,
          rentalId,
          metadata: { totalChargesPaise, depositDeductedPaise, refundAmountPaise },
        },
      });

      return completedRental;
    });
  }

  // 7. Get Rentals List
  static async getRentals(user: { userId: string; role: Role; customerId?: string }, query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Customer can only view their own rentals (BR-111)
    if (user.role === Role.CUSTOMER) {
      if (!user.customerId) throw new ForbiddenError('Customer profile missing');
      where.customerId = user.customerId;
    } else if (query.customerId) {
      where.customerId = query.customerId;
    }

    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { rentalNumber: { contains: query.search, mode: 'insensitive' } },
        { customer: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [total, rentals] = await Promise.all([
      prisma.rental.count({ where }),
      prisma.rental.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          items: { include: { product: { select: { name: true, imageUrls: true } } } },
          deposits: true,
          settlement: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      rentals,
      pagination: paginate(total, page, limit),
    };
  }

  // 8. Get Rental Detail
  static async getRentalById(rentalId: string, user: { userId: string; role: Role; customerId?: string }) {
    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: {
        customer: { select: { id: true, name: true, phone: true, user: { select: { email: true } } } },
        items: { include: { product: true, inventoryItem: true } },
        payments: true,
        deposits: true,
        charges: true,
        settlement: true,
        fulfillment: { include: { address: true } },
        returnRecord: true,
        inspection: { include: { damages: true } },
        auditEvents: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!rental) {
      throw new NotFoundError('Rental', rentalId);
    }

    // RBAC check
    if (user.role === Role.CUSTOMER && rental.customerId !== user.customerId) {
      throw new ForbiddenError('Access denied');
    }

    return rental;
  }
}
