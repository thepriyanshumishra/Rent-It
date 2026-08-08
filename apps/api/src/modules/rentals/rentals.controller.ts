import { Request, Response, NextFunction } from 'express';
import { RentalsService } from './rentals.service';
import { sendSuccess } from '../../utils/response';
import { UnauthorizedError } from '../../utils/errors';

export class RentalsController {
  static async checkoutCart(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.customerId) throw new UnauthorizedError('Customer profile required');
      const { fulfillmentType, notes } = req.body;
      const rental = await RentalsService.checkoutCart(req.user.customerId, fulfillmentType, notes);
      return sendSuccess(res, rental, 201);
    } catch (error) {
      next(error);
    }
  }

  static async confirmPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const customerId = req.user?.role === 'CUSTOMER' ? req.user.customerId : undefined;
      const rental = await RentalsService.confirmPayment(id, customerId);
      return sendSuccess(res, rental);
    } catch (error) {
      next(error);
    }
  }

  static async getRentals(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await RentalsService.getRentals(req.user!, req.query);
      return sendSuccess(res, result.rentals, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getRentalById(req: Request, res: Response, next: NextFunction) {
    try {
      const rental = await RentalsService.getRentalById(req.params.id, req.user!);
      return sendSuccess(res, rental);
    } catch (error) {
      next(error);
    }
  }

  static async confirmPickup(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { items } = req.body;
      const rental = await RentalsService.confirmPickup(id, req.user!.userId, items);
      return sendSuccess(res, rental);
    } catch (error) {
      next(error);
    }
  }

  static async processReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { returnedAt, notes } = req.body;
      const rental = await RentalsService.processReturn(id, req.user!.userId, returnedAt, notes);
      return sendSuccess(res, rental);
    } catch (error) {
      next(error);
    }
  }

  static async processInspection(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { result, notes, damages } = req.body;
      const rental = await RentalsService.processInspection(id, req.user!.userId, result, notes, damages);
      return sendSuccess(res, rental);
    } catch (error) {
      next(error);
    }
  }

  static async settleRental(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { notes, extraChargePaise, extraChargeReason } = req.body;
      const rental = await RentalsService.settleRental(id, req.user!.userId, notes, extraChargePaise, extraChargeReason);
      return sendSuccess(res, rental);
    } catch (error) {
      next(error);
    }
  }
}
