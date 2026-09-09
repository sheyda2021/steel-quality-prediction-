import { Request, Response, NextFunction } from 'express';
import { bankService } from '@services/bank.service';
import { AuthenticatedRequest } from '@middleware/auth.middleware';

export class BankController {
  async createAccount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const account = await bankService.createAccount({ companyId: req.user!.companyId, ...req.body });
      res.status(201).json({ success: true, message: 'حساب بانکی ایجاد شد', data: account });
    } catch (error) {
      next(error);
    }
  }

  async getAccounts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const accounts = await bankService.getAllAccounts(req.user!.companyId);
      res.json({ success: true, data: accounts });
    } catch (error) {
      next(error);
    }
  }

  async getAccount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const account = await bankService.getAccount(req.user!.companyId, id);
      if (!account) { res.status(404).json({ success: false, message: 'حساب بانکی یافت نشد' }); return; }
      res.json({ success: true, data: account });
    } catch (error) {
      next(error);
    }
  }

  async createTransaction(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const tx = await bankService.createTransaction({ companyId: req.user!.companyId, ...req.body });
      res.status(201).json({ success: true, message: 'تراکنش بانکی ثبت شد', data: tx });
    } catch (error) {
      next(error);
    }
  }

  async getTransactions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const transactions = await bankService.getAllTransactions(req.user!.companyId);
      res.json({ success: true, data: transactions });
    } catch (error) {
      next(error);
    }
  }

  async reconcile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bankAccountId } = req.params;
      const { transactions } = req.body;
      const result = await bankService.reconcileBankStatement(req.user!.companyId, bankAccountId, transactions);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const bankController = new BankController();
