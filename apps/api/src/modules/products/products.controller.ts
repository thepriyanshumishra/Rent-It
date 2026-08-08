import { Request, Response, NextFunction } from 'express';
import { ProductsService } from './products.service';
import { sendSuccess } from '../../utils/response';

export class ProductsController {
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProductsService.getProducts(req.query as any);
      return sendSuccess(res, result.products, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await ProductsService.getCategories();
      return sendSuccess(res, categories);
    } catch (error) {
      next(error);
    }
  }

  static async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductsService.getProductById(req.params.id);
      return sendSuccess(res, product);
    } catch (error) {
      next(error);
    }
  }

  static async checkAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { startDate, endDate, quantity } = req.query as any;
      const availability = await ProductsService.checkAvailability(
        id,
        startDate as string,
        endDate as string,
        Number(quantity) || 1,
      );
      return sendSuccess(res, availability);
    } catch (error) {
      next(error);
    }
  }
}
