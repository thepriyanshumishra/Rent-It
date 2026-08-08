import { Request, Response, NextFunction } from 'express';
import { CartService } from './cart.service';
import { sendSuccess } from '../../utils/response';
import { UnauthorizedError } from '../../utils/errors';

export class CartController {
  static async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.customerId) {
        throw new UnauthorizedError('Customer profile required');
      }
      const cart = await CartService.getCart(req.user.customerId);
      return sendSuccess(res, cart);
    } catch (error) {
      next(error);
    }
  }

  static async addItem(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.customerId) {
        throw new UnauthorizedError('Customer profile required');
      }
      const { productId, quantity, startDate, endDate } = req.body;
      const item = await CartService.addItem(
        req.user.customerId,
        productId,
        quantity,
        startDate,
        endDate,
      );
      return sendSuccess(res, item, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.customerId) {
        throw new UnauthorizedError('Customer profile required');
      }
      const updated = await CartService.updateItem(req.user.customerId, req.params.itemId, req.body);
      return sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  }

  static async removeItem(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.customerId) {
        throw new UnauthorizedError('Customer profile required');
      }
      const result = await CartService.removeItem(req.user.customerId, req.params.itemId);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async clearCart(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.customerId) {
        throw new UnauthorizedError('Customer profile required');
      }
      const result = await CartService.clearCart(req.user.customerId);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}
