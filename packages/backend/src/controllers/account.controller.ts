import { Request, Response, NextFunction } from 'express';
import { accountService } from '@services/account.service';
import { AuthenticatedRequest } from '@middleware/auth.middleware';
import { AccountType, AccountCategory } from '@prisma/client';

export class AccountController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const account = await accountService.createAccount({
        companyId: req.user!.companyId,
        ...req.body,
      });

      res.status(201).json({
        success: true,
        message: 'حساب با موفقیت ایجاد شد',
        data: account,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, category, isActive, search } = req.query;
      const accounts = await accountService.getAccounts(req.user!.companyId, {
        type: type as AccountType | undefined,
        category: category as AccountCategory | undefined,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        search: search as string | undefined,
      });

      res.json({ success: true, data: accounts });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const account = await accountService.getAccount(req.user!.companyId, id);

      if (!account) {
        res.status(404).json({ success: false, message: 'حساب یافت نشد' });
        return;
      }

      res.json({ success: true, data: account });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const account = await accountService.updateAccount(req.user!.companyId, id, req.body);

      res.json({ success: true, message: 'حساب با موفقیت بروز رسانی شد', data: account });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await accountService.deleteAccount(req.user!.companyId, id);

      res.json({ success: true, message: 'حساب با موفقیت حذف شد' });
    } catch (error) {
      next(error);
    }
  }

  async getChart(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const chart = await accountService.getChartOfAccounts(req.user!.companyId);
      res.json({ success: true, data: chart });
    } catch (error) {
      next(error);
    }
  }
}

export const accountController = new AccountController();
