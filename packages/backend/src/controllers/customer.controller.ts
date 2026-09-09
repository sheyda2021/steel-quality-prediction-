import { Request, Response, NextFunction } from 'express';
import { customerService } from '@services/customer.service';
import { AuthenticatedRequest } from '@middleware/auth.middleware';

export class CustomerController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const customer = await customerService.create({ companyId: req.user!.companyId, ...req.body });
      res.status(201).json({ success: true, message: 'مشتری ایجاد شد', data: customer });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search } = req.query;
      const customers = await customerService.getAll(req.user!.companyId, search as string | undefined);
      res.json({ success: true, data: customers });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const customer = await customerService.get(req.user!.companyId, id);
      if (!customer) { res.status(404).json({ success: false, message: 'مشتری یافت نشد' }); return; }
      res.json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const customer = await customerService.update(req.user!.companyId, id, req.body);
      res.json({ success: true, message: 'مشتری بروز رسانی شد', data: customer });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await customerService.delete(req.user!.companyId, id);
      res.json({ success: true, message: 'مشتری حذف شد' });
    } catch (error) {
      next(error);
    }
  }
}

export const customerController = new CustomerController();
