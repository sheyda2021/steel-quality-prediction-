import { Request, Response, NextFunction } from 'express';
import { journalService } from '@services/journal.service';
import { AuthenticatedRequest } from '@middleware/auth.middleware';
import { UserRole } from '@shared';

export class JournalController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const entry = await journalService.createJournalEntry({
        companyId: req.user!.companyId,
        ...req.body,
      });
      res.status(201).json({ success: true, message: 'سند حسابداری ایجاد شد', data: entry });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate, type, isPosted, search, page, limit } = req.query;
      const result = await journalService.getEntries(req.user!.companyId, {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        type: type as any,
        isPosted: isPosted === 'true' ? true : isPosted === 'false' ? false : undefined,
        search: search as string | undefined,
      }, Number(page) || 1, Number(limit) || 50);

      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const entry = await journalService.getEntry(req.user!.companyId, id);
      if (!entry) {
        res.status(404).json({ success: false, message: 'سند یافت نشد' });
        return;
      }
      res.json({ success: true, data: entry });
    } catch (error) {
      next(error);
    }
  }

  async post(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const entry = await journalService.postEntry(req.user!.companyId, id, req.user!.userId);
      res.json({ success: true, message: 'سند با موفقیت ثبت شد', data: entry });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await journalService.deleteEntry(req.user!.companyId, id);
      res.json({ success: true, message: 'سند حذف شد' });
    } catch (error) {
      next(error);
    }
  }
}

export const journalController = new JournalController();
