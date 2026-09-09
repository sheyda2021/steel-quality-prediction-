import { Request, Response, NextFunction } from 'express';
import { invoiceService } from '@services/invoice.service';
import { AuthenticatedRequest } from '@middleware/auth.middleware';

export class InvoiceController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const invoice = await invoiceService.create({ companyId: req.user!.companyId, ...req.body });
      res.status(201).json({ success: true, message: 'فاکتور ایجاد شد', data: invoice });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, customerId, startDate, endDate } = req.query;
      const invoices = await invoiceService.getAll(req.user!.companyId, {
        status: status as any,
        customerId: customerId as string | undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });
      res.json({ success: true, data: invoices });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const invoice = await invoiceService.get(req.user!.companyId, id);
      if (!invoice) { res.status(404).json({ success: false, message: 'فاکتور یافت نشد' }); return; }
      res.json({ success: true, data: invoice });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const invoice = await invoiceService.update(req.user!.companyId, id, req.body);
      res.json({ success: true, message: 'فاکتور بروز رسانی شد', data: invoice });
    } catch (error) {
      next(error);
    }
  }

  async post(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const invoice = await invoiceService.post(id);
      res.json({ success: true, message: 'فاکتور ثبت شد', data: invoice });
    } catch (error) {
      next(error);
    }
  }

  async makePayment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { amount } = req.body;
      const invoice = await invoiceService.makePayment(id, amount);
      res.json({ success: true, message: 'پرداخت ثبت شد', data: invoice });
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const invoice = await invoiceService.cancel(req.user!.companyId, id);
      res.json({ success: true, message: 'فاکتور لغو شد', data: invoice });
    } catch (error) {
      next(error);
    }
  }

  async getCustomerBalance(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { customerId } = req.params;
      const balance = await invoiceService.getCustomerBalance(req.user!.companyId, customerId);
      res.json({ success: true, data: { balance } });
    } catch (error) {
      next(error);
    }
  }
}

export const invoiceController = new InvoiceController();
