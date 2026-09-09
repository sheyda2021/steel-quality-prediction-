import { Request, Response, NextFunction } from 'express';
import { reportService } from '@services/report.service';
import { AuthenticatedRequest } from '@middleware/auth.middleware';
import { ReportType } from '@shared';

export class ReportController {
  async generate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type } = req.params;
      const { startDate, endDate, asOfDate } = req.query;

      switch (type) {
        case ReportType.BalanceSheet:
          const balanceSheet = await reportService.getBalanceSheet(
            req.user!.companyId,
            asOfDate ? new Date(asOfDate as string) : new Date()
          );
          res.json({ success: true, data: balanceSheet });
          break;

        case ReportType.IncomeStatement:
          const incomeStatement = await reportService.getIncomeStatement(
            req.user!.companyId,
            startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), 0, 1),
            endDate ? new Date(endDate as string) : new Date()
          );
          res.json({ success: true, data: incomeStatement });
          break;

        case ReportType.TrialBalance:
          const trialBalance = await reportService.getTrialBalance(req.user!.companyId);
          res.json({ success: true, data: trialBalance });
          break;

        default:
          res.status(400).json({ success: false, message: 'نوع گزارش نامعتبر' });
      }
    } catch (error) {
      next(error);
    }
  }
}

export const reportController = new ReportController();
