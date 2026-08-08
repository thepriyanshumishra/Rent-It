import { Router } from 'express';
import { RentalsController } from './rentals.controller';
import { validate } from '../../middleware/validate';
import { authenticateToken, requireRole } from '../../middleware/auth';
import { Role } from '@prisma/client';
import {
  checkoutSchema,
  pickupSchema,
  returnSchema,
  inspectionSchema,
  settlementSchema,
} from './rentals.schema';

const router = Router();

router.use(authenticateToken);

router.get('/', RentalsController.getRentals);
router.get('/:id', RentalsController.getRentalById);

// Customer Checkout & Payment
router.post('/checkout', validate(checkoutSchema), RentalsController.checkoutCart);
router.post('/:id/confirm-payment', RentalsController.confirmPayment);

// Admin / Staff Operations
router.post(
  '/:id/pickup',
  requireRole(Role.ADMIN, Role.STAFF),
  validate(pickupSchema),
  RentalsController.confirmPickup,
);
router.post(
  '/:id/return',
  requireRole(Role.ADMIN, Role.STAFF),
  validate(returnSchema),
  RentalsController.processReturn,
);
router.post(
  '/:id/inspect',
  requireRole(Role.ADMIN, Role.STAFF),
  validate(inspectionSchema),
  RentalsController.processInspection,
);
router.post(
  '/:id/settle',
  requireRole(Role.ADMIN, Role.STAFF),
  validate(settlementSchema),
  RentalsController.settleRental,
);

export default router;
