import { Request, Response, NextFunction } from 'express';
import { billService } from '@services/bill.service';
import { AuthenticatedRequest } from '@middleware/auth.middleware';

export class BillController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const bill = await billService.create({ companyId: req.user!.companyId, ...req.body });
      res.status(201).json({ success: true, message: 'صورتحساب ایجاد شد', data: bill });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, supplierId, startDate, endDate } = req.query;
      const bills = await billService.getAll(req.user!.companyId, {
        status: status as any,
        supplierId: supplierId as string | undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });
      res.json({ success: true, data: bills });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const bill = await billService.get(req.user!.companyId, id);
      if (!bill) { res.status(404).json({ success: false, message: 'صورتحساب یافت نشد' }); return; }
      res.json({ success: true, data: bill });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const bill = await billService.update(req.user!.companyId, id, req.body);
      res.json({ success: true, message: 'صورتحساب بروز رسانی شد', data: bill });
    } catch (error) {
      next(error);
    }
  }

  async post(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const bill = await billService.post(id);
      res.json({ success: true, message: 'صورتحساب ثبت شد', data: bill });
    } catch (error) {
      next(error);
    }
  }

  async makePayment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { amount } = req.body;
      const bill = await billService.makePayment(id, amount);
      res.json({ success: true, message: 'پرداخت ثبت شد', data: bill });
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const bill = await billService.cancel(req.user!.companyId, id);
      res.json({ success: true, message: 'صورتحساب لغو شد', data: bill });
    } catch (error) {
      next(error);
    }
  }
}

export const billController = new BillController();
