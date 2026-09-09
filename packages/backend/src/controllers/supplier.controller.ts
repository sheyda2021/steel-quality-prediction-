import { Request, Response, NextFunction } from 'express';
import { supplierService } from '@services/supplier.service';
import { AuthenticatedRequest } from '@middleware/auth.middleware';

export class SupplierController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const supplier = await supplierService.create({ companyId: req.user!.companyId, ...req.body });
      res.status(201).json({ success: true, message: 'تامین‌کننده ایجاد شد', data: supplier });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search } = req.query;
      const suppliers = await supplierService.getAll(req.user!.companyId, search as string | undefined);
      res.json({ success: true, data: suppliers });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const supplier = await supplierService.get(req.user!.companyId, id);
      if (!supplier) { res.status(404).json({ success: false, message: 'تامین‌کننده یافت نشد' }); return; }
      res.json({ success: true, data: supplier });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const supplier = await supplierService.update(req.user!.companyId, id, req.body);
      res.json({ success: true, message: 'تامین‌کننده بروز رسانی شد', data: supplier });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await supplierService.delete(req.user!.companyId, id);
      res.json({ success: true, message: 'تامین‌کننده حذف شد' });
    } catch (error) {
      next(error);
    }
  }
}

export const supplierController = new SupplierController();
