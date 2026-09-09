import { Request, Response, NextFunction } from 'express';
import { aiIntegrationService } from '@services/ai-integration.service';
import { AuthenticatedRequest } from '@middleware/auth.middleware';

export class AiController {
  async getCategorizationSuggestion(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { description, amount } = req.body;
      const result = await aiIntegrationService.classifyTransaction(description, amount, req.user!.companyId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getCashFlowForecast(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { days } = req.query;
      const forecast = await aiIntegrationService.generateCashFlowForecast(req.user!.companyId, Number(days) || 30);
      res.json({ success: true, data: forecast });
    } catch (error) {
      next(error);
    }
  }

  async getAnomalies(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const anomalies = await aiIntegrationService.detectAnomalies(req.user!.companyId);
      res.json({ success: true, data: anomalies });
    } catch (error) {
      next(error);
    }
  }

  async getTaxOptimization(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const suggestions = await aiIntegrationService.getTaxOptimizationSuggestions(req.user!.companyId);
      res.json({ success: true, data: suggestions });
    } catch (error) {
      next(error);
    }
  }

  async getSuggestions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type } = req.query;
      const suggestions = await aiIntegrationService.getSuggestions(req.user!.companyId, type as any);
      res.json({ success: true, data: suggestions });
    } catch (error) {
      next(error);
    }
  }

  async applySuggestion(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await aiIntegrationService.applySuggestion(id, req.user!.companyId);
      res.json({ success: true, message: 'پیشنهاد اعمال شد' });
    } catch (error) {
      next(error);
    }
  }
}

export const aiController = new AiController();
