import { CashFlowForecastPoint } from '@shared';

export class ForecastingEngine {
  async predictCashFlow(historicalTransactions: any[], forecastDays: number = 30): Promise<CashFlowForecastPoint[]> {
    const dailyFlows = this.aggregateByDay(historicalTransactions);
    const forecast: CashFlowForecastPoint[] = [];
    const baseInflow = this.calculateAverage(dailyFlows.inflows);
    const baseOutflow = this.calculateAverage(dailyFlows.outflows);

    for (let i = 1; i <= forecastDays; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const trend = this.calculateTrend(dailyFlows);
      const randomFactor = 0.9 + Math.random() * 0.2;

      const predictedInflow = baseInflow * trend * randomFactor;
      const predictedOutflow = baseOutflow * trend * randomFactor;
      const netCashFlow = predictedInflow - predictedOutflow;
      const confidence = this.calculateConfidence(dailyFlows, i);

      forecast.push({
        date: date.toISOString().split('T')[0],
        predictedInflow: Math.round(predictedInflow),
        predictedOutflow: Math.round(predictedOutflow),
        netCashFlow: Math.round(netCashFlow),
        confidenceLower: Math.round(predictedInflow * confidence.low),
        confidenceUpper: Math.round(predictedInflow * confidence.high),
      });
    }

    return forecast;
  }

  private aggregateByDay(transactions: any[]): { inflows: number[]; outflows: number[] } {
    const dailyMap = new Map<string, { in: number; out: number }>();

    for (const tx of transactions) {
      const dateKey = new Date(tx.date).toISOString().split('T')[0];
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { in: 0, out: 0 });
      }
      const day = dailyMap.get(dateKey)!;
      if (tx.type === 'RECEIPT' || tx.type === 'INVOICE') {
        day.in += Number(tx.amount);
      } else {
        day.out += Number(tx.amount);
      }
    }

    const inflows: number[] = [];
    const outflows: number[] = [];
    dailyMap.forEach(day => {
      inflows.push(day.in);
      outflows.push(day.out);
    });
    return { inflows, outflows };
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateTrend(dailyFlows: { inflows: number[]; outflows: number[] }): number {
    const allFlows = [...dailyFlows.inflows, ...dailyFlows.outflows];
    if (allFlows.length < 2) return 1;
    const recentAvg = allFlows.slice(-7).reduce((a, b) => a + b, 0) / 7;
    const olderAvg = allFlows.slice(0, Math.min(7, allFlows.length - 1)).reduce((a, b) => a + b, 0) / Math.min(7, allFlows.length - 1);
    if (olderAvg === 0) return 1;
    return recentAvg / olderAvg;
  }

  private calculateConfidence(dailyFlows: { inflows: number[]; outflows: number[] }, daysAhead: number): { low: number; high: number } {
    const baseConfidence = Math.max(0.5, 1 - (daysAhead * 0.02));
    const dataConfidence = Math.min(1, (dailyFlows.inflows.length + dailyFlows.outflows.length) / 30);
    const confidence = baseConfidence * dataConfidence;
    return { low: confidence * 0.85, high: Math.min(1, confidence * 1.15) };
  }

  async detectAnomalies(transactions: any[]): Promise<any[]> {
    const anomalies: any[] = [];
    const amounts = transactions.map(t => Number(t.amount));
    const avgAmount = this.calculateAverage(amounts);
    const stdDev = this.calculateStdDev(amounts);

    for (const tx of transactions) {
      const amount = Number(tx.amount);
      const zScore = Math.abs(amount - avgAmount) / (stdDev || 1);
      if (zScore > 2.5) {
        anomalies.push({
          transactionId: tx.id,
          reason: `مبلغ غیرعادی (${amount}) از میانگین فاصله دارد`,
          severity: zScore > 4 ? 'high' : zScore > 3 ? 'medium' : 'low',
          confidence: Math.min(0.99, zScore / 5),
          amount,
        });
      }
    }
    return anomalies;
  }

  private calculateStdDev(values: number[]): number {
    if (values.length === 0) return 0;
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squareDiffs = values.map(val => Math.pow(val - avg, 2));
    return Math.sqrt(squareDiffs.reduce((sum, val) => sum + val, 0) / values.length);
  }

  async suggestTaxOptimizations(accounts: any[], transactions: any[]): Promise<any[]> {
    const suggestions: any[] = [];
    const expenseAccounts = accounts.filter(a => a.type === 'EXPENSE');

    for (const account of expenseAccounts) {
      const accountTx = transactions.filter(t => t.accountId === account.id);
      const total = accountTx.reduce((sum, t) => sum + Number(t.amount), 0);

      if (total > 10000 && account.name.toLowerCase().includes('تبلیغات')) {
        suggestions.push({
          accountId: account.id,
          accountName: account.name,
          currentAmount: total,
          suggestedAmount: total * 0.8,
          potentialSaving: total * 0.2,
          explanation: 'پیشنهاد کاهش هزینه‌های تبلیغاتی برای بهینه‌سازی مالیات',
        });
      }
    }
    return suggestions;
  }
}

export const forecastingEngine = new ForecastingEngine();
