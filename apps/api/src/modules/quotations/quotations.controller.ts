import { Request, Response, NextFunction } from 'express';
import { QuotationsService } from './quotations.service';
import { sendSuccess } from '../../utils/response';

export class QuotationsController {
  static async createQuotation(req: Request, res: Response, next: NextFunction) {
    try {
      const quotation = await QuotationsService.createQuotation(req.user!, req.body);
      return sendSuccess(res, quotation, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getQuotations(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await QuotationsService.getQuotations(req.user!);
      return sendSuccess(res, list);
    } catch (error) {
      next(error);
    }
  }
}
