import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service';
import { sendSuccess } from '../../utils/response';

export class AdminController {
  static async getDashboardMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getDashboardMetrics();
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  static async getInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.getInventory(req.query);
      return sendSuccess(res, result.items, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async createInventoryItem(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await AdminService.createInventoryItem(req.body);
      return sendSuccess(res, item, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateInventoryStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, condition } = req.body;
      const item = await AdminService.updateInventoryStatus(id, status, condition);
      return sendSuccess(res, item);
    } catch (error) {
      next(error);
    }
  }

  static async getRepairs(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.getRepairs(req.query);
      return sendSuccess(res, result.repairs, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async updateRepair(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const repair = await AdminService.updateRepair(id, req.body);
      return sendSuccess(res, repair);
    } catch (error) {
      next(error);
    }
  }

  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await AdminService.createProduct(req.body);
      return sendSuccess(res, product, 201);
    } catch (error) {
      next(error);
    }
  }
}
