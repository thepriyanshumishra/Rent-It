import { z } from 'zod';
import { ProductStatus } from '@prisma/client';

export const getProductsSchema = z.object({
  query: z.object({
    page: z.coerce.number().optional().default(1),
    limit: z.coerce.number().optional().default(12),
    categoryId: z.string().optional(),
    search: z.string().optional(),
    status: z.nativeEnum(ProductStatus).optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    startDate: z.string().datetime({ offset: true }).optional(),
    endDate: z.string().datetime({ offset: true }).optional(),
  }),
});

export const checkAvailabilitySchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  query: z.object({
    startDate: z.string().datetime({ offset: true }),
    endDate: z.string().datetime({ offset: true }),
    quantity: z.coerce.number().optional().default(1),
  }),
});

export const createProductSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid('Category ID must be valid UUID'),
    name: z.string().min(2, 'Name is required'),
    description: z.string().optional(),
    shortDesc: z.string().optional(),
    status: z.nativeEnum(ProductStatus).optional().default(ProductStatus.ACTIVE),
    depositAmountPaise: z.number().int().nonnegative().default(0),
    imageUrls: z.array(z.string().url()).optional().default([]),
    attributes: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
    priceRules: z.array(
      z.object({
        durationUnit: z.enum(['HOUR', 'DAY', 'WEEK', 'MONTH']),
        durationValue: z.number().int().positive().default(1),
        ratePaise: z.number().int().positive('Rate must be positive integer paise'),
      }),
    ).optional(),
  }),
});
