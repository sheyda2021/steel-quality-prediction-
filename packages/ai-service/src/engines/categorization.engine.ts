import { TransactionClassification } from '@shared';

const CATEGORY_MAP: Record<string, string> = {
  'غذا': 'EXPENSE',
  'غذای': 'EXPENSE',
  'اجاره': 'EXPENSE',
  'حقوق': 'EXPENSE',
  'مزایا': 'EXPENSE',
  'حق بیمه': 'EXPENSE',
  'کارمزد': 'EXPENSE',
  'سوخت': 'EXPENSE',
  'حمل و نقل': 'EXPENSE',
  'تلفن': 'EXPENSE',
  'اینترنت': 'EXPENSE',
  'آب': 'EXPENSE',
  'برق': 'EXPENSE',
  'گاز': 'EXPENSE',
  'بازاریابی': 'EXPENSE',
  'تبلیغات': 'EXPENSE',
  'آموزش': 'EXPENSE',
  'سفر': 'EXPENSE',
  'هتل': 'EXPENSE',
  'فروش': 'REVENUE',
  'پیشنهادی': 'REVENUE',
  'سود': 'REVENUE',
  'عمولی': 'REVENUE',
  'جریمه': 'EXPENSE',
  'کاهش': 'EXPENSE',
};

interface TrainingData {
  description: string;
  accountId: string | null;
  category: string | null;
}

export class CategorizationEngine {
  private trainingData: TrainingData[] = [];

  addTrainingData(data: TrainingData[]): void {
    this.trainingData.push(...data);
  }

  classifyTransaction(
    description: string,
    amount: number,
    availableAccounts: any[]
  ): TransactionClassification {
    const descLower = description.toLowerCase();

    for (const [keyword, type] of Object.entries(CATEGORY_MAP)) {
      if (descLower.includes(keyword)) {
        const account = availableAccounts.find(a => a.type === type && a.isActive);
        if (account) {
          return {
            accountId: account.id,
            category: account.category || null,
            confidence: 0.85,
            explanation: `دسته‌بندی بر اساس کلیدواژه "${keyword}"`,
          };
        }
      }
    }

    const similar = this.findSimilarTransactions(description);
    if (similar.length > 0) {
      const mostCommon = this.getMostFrequentAccount(similar);
      if (mostCommon) {
        return {
          accountId: mostCommon.accountId,
          category: mostCommon.category,
          confidence: 0.75,
          explanation: 'دسته‌بندی بر اساس تراکنش‌های مشابه',
        };
      }
    }

    if (amount > 10000) {
      const revenueAccount = availableAccounts.find(a => a.type === 'REVENUE' && a.isActive);
      if (revenueAccount) {
        return {
          accountId: revenueAccount.id,
          category: revenueAccount.category || null,
          confidence: 0.6,
          explanation: 'تراکنش بزرگ احتمالاً درآمد است',
        };
      }
    }

    return {
      accountId: null,
      category: null,
      confidence: 0.0,
      explanation: 'هیچ دسته‌بندی مناسب یافت نشد - نیاز به بررسی دستی',
    };
  }

  private findSimilarTransactions(description: string): TrainingData[] {
    const descLower = description.toLowerCase();
    return this.trainingData.filter(item => {
      const itemDesc = item.description.toLowerCase();
      return descLower.includes(itemDesc.slice(0, 5)) || itemDesc.includes(descLower.slice(0, 5));
    });
  }

  private getMostFrequentAccount(transactions: TrainingData[]): { accountId: string; category: string | null } | null {
    const counts: Record<string, { count: number; category: string | null }> = {};

    for (const tx of transactions) {
      if (tx.accountId) {
        if (!counts[tx.accountId]) {
          counts[tx.accountId] = { count: 0, category: tx.category };
        }
        counts[tx.accountId].count++;
      }
    }

    let maxCount = 0;
    let result: { accountId: string; category: string | null } | null = null;

    for (const [accountId, data] of Object.entries(counts)) {
      if (data.count > maxCount) {
        maxCount = data.count;
        result = { accountId, category: data.category };
      }
    }

    return result;
  }
}

export const categorizationEngine = new CategorizationEngine();
