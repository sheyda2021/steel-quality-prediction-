import { prisma } from '@db';
import { AccountType, AccountCategory } from '@prisma/client';
import { BalanceSheetData, IncomeStatementData } from '@shared';

export class ReportService {
  async getBalanceSheet(companyId: string, asOfDate: Date): Promise<BalanceSheetData> {
    const assetAccounts = await prisma.account.findMany({
      where: {
        companyId,
        type: AccountType.ASSET,
        isActive: true,
      },
    });

    const liabilityAccounts = await prisma.account.findMany({
      where: {
        companyId,
        type: AccountType.LIABILITY,
        isActive: true,
      },
    });

    const equityAccounts = await prisma.account.findMany({
      where: {
        companyId,
        type: AccountType.EQUITY,
        isActive: true,
      },
    });

    const currentAssetTotal = await this.getAccountGroupBalance(companyId, assetAccounts, AccountCategory.CURRENT_ASSETS, asOfDate);
    const fixedAssetTotal = await this.getAccountGroupBalance(companyId, assetAccounts, AccountCategory.FIXED_ASSETS, asOfDate);

    const currentLiabilityTotal = await this.getAccountGroupBalance(companyId, liabilityAccounts, AccountCategory.CURRENT_LIABILITIES, asOfDate);
    const longTermLiabilityTotal = await this.getAccountGroupBalance(companyId, liabilityAccounts, AccountCategory.LONG_TERM_LIABILITIES, asOfDate);

    const equityTotal = await this.getEquityBalance(companyId, equityAccounts, asOfDate);

    const totalAssets = currentAssetTotal + fixedAssetTotal;
    const totalLiabilities = currentLiabilityTotal + longTermLiabilityTotal;
    const totalLiabilitiesAndEquity = totalLiabilities + equityTotal;

    return {
      assets: { current: currentAssetTotal, fixed: fixedAssetTotal, total: totalAssets },
      liabilities: { current: currentLiabilityTotal, longTerm: longTermLiabilityTotal, total: totalLiabilities },
      equity: equityTotal,
      totalAssets,
      totalLiabilitiesAndEquity,
      date: asOfDate,
    };
  }

  private async getAccountGroupBalance(
    companyId: string,
    accounts: any[],
    category: AccountCategory | null,
    asOfDate: Date
  ): Promise<number> {
    const accountIds = accounts
      .filter(acc => (category ? acc.category === category : !acc.category))
      .map(acc => acc.id);

    if (accountIds.length === 0) return 0;

    const result = await prisma.journalEntry.aggregate({
      where: {
        companyId,
        isPosted: true,
        date: { lte: asOfDate },
        lines: { some: { accountId: { in: accountIds } } },
      },
      _sum: { totalDebit: true, totalCredit: true },
    });

    return Number(result._sum.totalDebit || 0) - Number(result._sum.totalCredit || 0);
  }

  private async getEquityBalance(
    companyId: string,
    equityAccounts: any[],
    asOfDate: Date
  ): Promise<number> {
    const accountIds = equityAccounts.map(acc => acc.id);

    if (accountIds.length === 0) return 0;

    const result = await prisma.journalEntry.aggregate({
      where: {
        companyId,
        isPosted: true,
        date: { lte: asOfDate },
        lines: { some: { accountId: { in: accountIds } } },
      },
      _sum: { totalDebit: true, totalCredit: true },
    });

    return Number(result._sum.totalCredit || 0) - Number(result._sum.totalDebit || 0);
  }

  async getIncomeStatement(companyId: string, startDate: Date, endDate: Date): Promise<IncomeStatementData> {
    const revenueAccounts = await prisma.account.findMany({
      where: { companyId, type: AccountType.REVENUE, isActive: true },
    });

    const expenseAccounts = await prisma.account.findMany({
      where: { companyId, type: AccountType.EXPENSE, isActive: true },
    });

    const revenue = await this.getAccountGroupTotal(companyId, revenueAccounts.map(a => a.id), startDate, endDate, 'credit');

    const cogs = await this.getAccountGroupTotal(
      companyId,
      [],
      startDate,
      endDate,
      'debit'
    );

    const operatingExpenses = await this.getAccountGroupTotal(
      companyId,
      expenseAccounts.filter(a => a.category !== AccountCategory.COST_OF_GOODS_SOLD).map(a => a.id),
      startDate,
      endDate,
      'debit'
    );

    const costOfGoodsSold = await this.getAccountGroupTotal(
      companyId,
      expenseAccounts.filter(a => a.category === AccountCategory.COST_OF_GOODS_SOLD).map(a => a.id),
      startDate,
      endDate,
      'debit'
    );

    const grossProfit = revenue - costOfGoodsSold;
    const operatingIncome = grossProfit - operatingExpenses;
    const netIncome = operatingIncome;

    return {
      revenue,
      costOfGoodsSold,
      grossProfit,
      operatingExpenses,
      operatingIncome,
      otherIncome: 0,
      otherExpenses: 0,
      netIncome,
      startDate,
      endDate,
    };
  }

  private async getAccountGroupTotal(
    companyId: string,
    accountIds: string[],
    startDate: Date,
    endDate: Date,
    normalBalance: 'debit' | 'credit'
  ): Promise<number> {
    if (accountIds.length === 0) return 0;

    const result = await prisma.journalEntry.aggregate({
      where: {
        companyId,
        isPosted: true,
        date: { gte: startDate, lte: endDate },
        lines: { some: { accountId: { in: accountIds } } },
      },
      _sum: { totalDebit: true, totalCredit: true },
    });

    const debit = Number(result._sum.totalDebit || 0);
    const credit = Number(result._sum.totalCredit || 0);

    if (normalBalance === 'debit') {
      return debit - credit;
    }
    return credit - debit;
  }

  async getTrialBalance(companyId: string): Promise<any> {
    const accounts = await prisma.account.findMany({
      where: { companyId, isActive: true },
    });

    const trialBalance: any[] = [];

    for (const account of accounts) {
      const balance = await this.getAccountBalance(companyId, account.id);
      trialBalance.push({
        accountId: account.id,
        accountCode: account.code,
        accountName: account.name,
        accountType: account.type,
        balance,
      });
    }

    return {
      accounts: trialBalance,
      totalDebit: trialBalance.filter(a => a.balance >= 0).reduce((sum, a) => sum + a.balance, 0),
      totalCredit: trialBalance.filter(a => a.balance < 0).reduce((sum, a) => sum + Math.abs(a.balance), 0),
    };
  }

  private async getAccountBalance(companyId: string, accountId: string): Promise<number> {
    const account = await prisma.account.findUnique({ where: { id: accountId } });
    if (!account) return 0;

    const result = await prisma.journalEntry.aggregate({
      where: {
        companyId,
        isPosted: true,
        lines: { some: { accountId } },
      },
      _sum: { totalDebit: true, totalCredit: true },
    });

    const debit = Number(result._sum.totalDebit || 0);
    const credit = Number(result._sum.totalCredit || 0);

    if (account.type === AccountType.ASSET || account.type === AccountType.EXPENSE) {
      return debit - credit;
    }
    return credit - debit;
  }
}

export const reportService = new ReportService();
