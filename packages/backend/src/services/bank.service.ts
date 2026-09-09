import { prisma } from '@db';
import { BankAccount, Transaction, TransactionType, Prisma } from '@prisma/client';
import { NotFoundError, ValidationError } from '@utils/errors';

interface BankAccountInput {
  name: string;
  bankName: string;
  accountNumber: string;
  iban?: string;
  currency?: string;
}

interface TransactionInput {
  date: Date;
  description: string;
  amount: number;
  currency?: string;
  type: TransactionType;
  accountId: string;
  referenceId?: string;
  bankAccountId: string;
}

export class BankService {
  async createAccount(data: BankAccountInput & { companyId: string }): Promise<BankAccount> {
    return prisma.bankAccount.create({
      data: {
        companyId: data.companyId,
        name: data.name,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        iban: data.iban,
        balance: 0,
        currency: data.currency || 'USD',
      },
    });
  }

  async getAccount(companyId: string, id: string): Promise<BankAccount | null> {
    return prisma.bankAccount.findFirst({ where: { id, companyId } });
  }

  async getAllAccounts(companyId: string): Promise<BankAccount[]> {
    return prisma.bankAccount.findMany({
      where: { companyId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async createTransaction(data: TransactionInput & { companyId: string }): Promise<Transaction> {
    const bankAccount = await this.getAccount(data.companyId, data.bankAccountId);
    if (!bankAccount) throw new NotFoundError('حساب بانکی یافت نشد');

    const account = await prisma.account.findFirst({
      where: { id: data.accountId, companyId: data.companyId },
    });
    if (!account) throw new NotFoundError('حساب یافت نشد');

    const tx = await prisma.transaction.create({
      data: {
        companyId: data.companyId,
        date: data.date,
        description: data.description,
        amount: new Prisma.Decimal(data.amount),
        currency: data.currency || 'USD',
        type: data.type,
        accountId: data.accountId,
        bankAccountId: data.bankAccountId,
        referenceId: data.referenceId,
        isCleared: data.type === TransactionType.TRANSFER,
      },
    });

    if (data.type === TransactionType.RECEIPT || data.type === TransactionType.INVOICE) {
      await prisma.bankAccount.update({
        where: { id: data.bankAccountId },
        data: { balance: { increment: new Prisma.Decimal(data.amount) } },
      });
    } else if (data.type === TransactionType.PAYMENT || data.type === TransactionType.BILL) {
      await prisma.bankAccount.update({
        where: { id: data.bankAccountId },
        data: { balance: { decrement: new Prisma.Decimal(data.amount) } },
      });
    }

    return tx;
  }

  async getAllTransactions(
    companyId: string,
    filters?: {
      bankAccountId?: string;
      startDate?: Date;
      endDate?: Date;
      type?: TransactionType;
      accountId?: string;
    }
  ): Promise<Transaction[]> {
    const where: any = { companyId };
    if (filters?.bankAccountId) where.bankAccountId = filters.bankAccountId;
    if (filters?.type) where.type = filters.type;
    if (filters?.startDate) where.date = { gte: filters.startDate };
    if (filters?.endDate) where.date = { ...where.date, lte: filters.endDate };
    if (filters?.accountId) where.accountId = filters.accountId;

    return prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }

  async reconcileBankStatement(
    companyId: string,
    bankAccountId: string,
    transactions: { date: Date; description: string; amount: number; type: 'credit' | 'debit' }[]
  ): Promise<{ matched: number; unmatched: number; suggestions: any[] }> {
    const existingTx = await prisma.transaction.findMany({
      where: { companyId, bankAccountId, isCleared: false },
    });

    let matched = 0;
    let unmatched = 0;

    const suggestions: any[] = [];

    for (const stmtTx of transactions) {
      const potentialMatch = existingTx.find(tx => {
        const amountMatch = Math.abs(Number(tx.amount) - stmtTx.amount) < 0.01;
        const dateMatch = Math.abs(tx.date.getTime() - stmtTx.date.getTime()) < 24 * 60 * 60 * 1000;
        return amountMatch && dateMatch;
      });

      if (potentialMatch) {
        matched++;
      } else {
        unmatched++;
        suggestions.push({
          statementTransaction: stmtTx,
          aiSuggestion: `تراکنش ${stmtTx.description} با مقدار ${stmtTx.amount} تطبیق نیافته است`,
        });
      }
    }

    return { matched, unmatched, suggestions };
  }
}

export const bankService = new BankService();
