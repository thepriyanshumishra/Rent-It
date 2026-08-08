import { z } from 'zod';

export const createQuotationSchema = z.object({
  body: z.object({
    customerId: z.string().uuid().optional(),
    validUntilDays: z.number().int().positive().default(7),
    notes: z.string().optional(),
    items: z.array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive().default(1),
        startDate: z.string().datetime({ offset: true }),
        endDate: z.string().datetime({ offset: true }),
      }),
    ).min(1, 'At least one item required'),
  }),
});
