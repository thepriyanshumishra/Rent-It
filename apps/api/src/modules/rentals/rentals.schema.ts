import { z } from 'zod';
import { FulfillmentType, InspectionResult, DamageSeverity } from '@prisma/client';

export const checkoutSchema = z.object({
  body: z.object({
    fulfillmentType: z.nativeEnum(FulfillmentType),
    addressId: z.string().uuid().optional(),
    notes: z.string().optional(),
    paymentMethod: z.enum(['SIMULATED', 'CASH', 'BANK_TRANSFER']).default('SIMULATED'),
  }),
});

export const createAdminRentalSchema = z.object({
  body: z.object({
    customerId: z.string().uuid('Customer ID required'),
    fulfillmentType: z.nativeEnum(FulfillmentType),
    startDate: z.string().datetime({ offset: true }),
    endDate: z.string().datetime({ offset: true }),
    items: z.array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive().default(1),
        inventoryItemId: z.string().uuid().optional(),
      }),
    ).min(1, 'At least one item required'),
    notes: z.string().optional(),
  }),
});

export const pickupSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    items: z.array(
      z.object({
        rentalItemId: z.string().uuid(),
        inventoryItemId: z.string().uuid(),
      }),
    ).optional(),
    notes: z.string().optional(),
  }),
});

export const returnSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    returnedAt: z.string().datetime({ offset: true }).optional(),
    notes: z.string().optional(),
  }),
});

export const inspectionSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    result: z.nativeEnum(InspectionResult),
    notes: z.string().optional(),
    damages: z.array(
      z.object({
        description: z.string().min(1),
        severity: z.nativeEnum(DamageSeverity),
        chargeAmountPaise: z.number().int().nonnegative(),
      }),
    ).optional(),
  }),
});

export const settlementSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    notes: z.string().optional(),
    extraChargePaise: z.number().int().nonnegative().optional().default(0),
    extraChargeReason: z.string().optional(),
  }),
});
