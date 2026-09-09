import axios from 'axios';
import { config } from '@config';
import { prisma } from '@db';
import { AiSuggestion, AiSuggestionType } from '@shared';

export class AiIntegrationService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.aiServiceUrl;
  }

  async classifyTransaction(description: string, amount: number, companyId: string): Promise<any> {
    try {
      const accounts = await prisma.account.findMany({
        where: { companyId, isActive: true },
      });

      const response = await axios.post(`${this.baseUrl}/categorize`, {
        description,
        amount,
        accounts,
      });

      return response.data.data;
    } catch (error) {
      return { accountId: null, category: null, confidence: 0, explanation: 'خطا در سرویس AI' };
    }
  }

  async generateCashFlowForecast(companyId: string, days: number = 30): Promise<any> {
    try {
      const transactions = await prisma.transaction.findMany({
        where: { companyId },
        select: { id: true, date: true, amount: true, type: true, accountId: true },
      });

      const response = await axios.post(`${this.baseUrl}/forecast`, {
        transactions,
        days,
      });

      return response.data.data;
    } catch (error) {
      return [];
    }
  }

  async detectAnomalies(companyId: string): Promise<any[]> {
    try {
      const transactions = await prisma.transaction.findMany({
        where: { companyId },
        select: { id: true, date: true, amount: true, type: true, accountId: true },
      });

      const response = await axios.post(`${this.baseUrl}/anomalies`, {
        transactions,
      });

      return response.data.data;
    } catch (error) {
      return [];
    }
  }

  async getTaxOptimizationSuggestions(companyId: string): Promise<any[]> {
    try {
      const accounts = await prisma.account.findMany({
        where: { companyId, isActive: true },
      });

      const transactions = await prisma.transaction.findMany({
        where: { companyId },
        select: { id: true, date: true, amount: true, type: true, accountId: true },
      });

      const response = await axios.post(`${this.baseUrl}/tax-optimization`, {
        accounts,
        transactions,
      });

      return response.data.data;
    } catch (error) {
      return [];
    }
  }

  async saveAiSuggestions(companyId: string, suggestions: any[], type: AiSuggestionType): Promise<void> {
    for (const suggestion of suggestions) {
      await prisma.aiSuggestion.create({
        data: {
          companyId,
          type,
          title: suggestion.title || suggestion.reason || 'پیشنهاد هوش مصنوعی',
          description: suggestion.explanation || suggestion.description || '',
          data: suggestion,
          confidence: suggestion.confidence || 0,
        },
      });
    }
  }

  async getSuggestions(companyId: string, type?: AiSuggestionType): Promise<AiSuggestion[]> {
    const where: any = { companyId, isApplied: false };
    if (type) where.type = type;

    return prisma.aiSuggestion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    }) as unknown as Promise<AiSuggestion[]>;
  }

  async applySuggestion(suggestionId: string, companyId: string): Promise<void> {
    const suggestion = await prisma.aiSuggestion.findFirst({
      where: { id: suggestionId, companyId },
    });

    if (!suggestion) {
      throw new Error('پیشنهاد یافت نشد');
    }

    await prisma.aiSuggestion.update({
      where: { id: suggestionId },
      data: { isApplied: true },
    });
  }
}

export const aiIntegrationService = new AiIntegrationService();
