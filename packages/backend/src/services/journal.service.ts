import { prisma } from '@db';
import { JournalEntry, JournalEntryLine, TransactionType, Prisma } from '@prisma/client';
import { NotFoundError, ValidationError } from '@utils/errors';
import { generateCode } from '@utils/cuid';

interface JournalLineInput {
  accountId: string;
  description?: string;
  debit?: number;
  credit?: number;
  currency?: string;
}

interface JournalEntryInput {
  date: Date;
  description: string;
  type?: TransactionType;
  referenceId?: string;
  currency?: string;
  lines: JournalLineInput[];
  createdBy: string;
}

export class JournalService {
  async createJournalEntry(data: JournalEntryInput): Promise<JournalEntry> {
    const totalDebit = data.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredit = data.lines.reduce((sum, line) => sum + (line.credit || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      throw new ValidationError('جمع بدهی و بستانی باید برابر باشند');
    }

    for (const line of data.lines) {
      const account = await prisma.account.findFirst({
        where: { id: line.accountId, companyId: data.createdBy },
      });
      if (!account) {
        throw new NotFoundError(`حساب با کد ${line.accountId} یافت نشد`);
      }
    }

    const entryNumber = await this.generateEntryNumber(data.createdBy, data.date);

    const entry = await prisma.journalEntry.create({
      data: {
        companyId: data.createdBy,
        entryNumber,
        date: data.date,
        description: data.description,
        type: data.type || TransactionType.JOURNAL_ENTRY,
        referenceId: data.referenceId,
        totalDebit: new Prisma.Decimal(totalDebit),
        totalCredit: new Prisma.Decimal(totalCredit),
        currency: data.currency || 'USD',
        isPosted: false,
        createdBy: data.createdBy,
        lines: {
          create: data.lines.map(line => ({
            accountId: line.accountId,
            description: line.description,
            debit: new Prisma.Decimal(line.debit || 0),
            credit: new Prisma.Decimal(line.credit || 0),
            currency: line.currency || 'USD',
          })),
        },
      },
      include: { lines: true },
    });

    await this.createAiSuggestionForEntry(entry);

    return entry;
  }

  private async generateEntryNumber(companyId: string, date: Date): Promise<string> {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    const count = await prisma.journalEntry.count({
      where: {
        companyId,
        entryNumber: { startsWith: `${year}-${month}` },
      },
    });

    const sequence = String(count + 1).padStart(4, '0');
    return `${year}-${month}-${sequence}`;
  }

  async postEntry(companyId: string, entryId: string, approvedBy: string): Promise<JournalEntry> {
    const entry = await this.getEntry(companyId, entryId);

    if (!entry) {
      throw new NotFoundError('سند یافت نشد');
    }

    if (entry.isPosted) {
      throw new ValidationError('سند قبلاً ثبت شده است');
    }

    return prisma.journalEntry.update({
      where: { id: entryId },
      data: {
        isPosted: true,
        approvedBy,
      },
    });
  }

  async getEntry(companyId: string, id: string): Promise<JournalEntry | null> {
    return prisma.journalEntry.findFirst({
      where: { id, companyId },
      include: { lines: { include: { account: true } } },
    });
  }

  async getEntries(companyId: string, filters?: {
    startDate?: Date;
    endDate?: Date;
    type?: TransactionType;
    isPosted?: boolean;
    search?: string;
  }, page: number = 1, limit: number = 50): Promise<{ entries: JournalEntry[]; total: number }> {
    const where: any = { companyId };

    if (filters?.type) where.type = filters.type;
    if (filters?.isPosted !== undefined) where.isPosted = filters.isPosted;
    if (filters?.startDate) where.date = { gte: filters.startDate };
    if (filters?.endDate) where.date = { ...where.date, lte: filters.endDate };
    if (filters?.search) {
      where.OR = [
        { entryNumber: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }

    const [entries, total] = await Promise.all([
      prisma.journalEntry.findMany({
        where,
        include: { lines: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      prisma.journalEntry.count({ where }),
    ]);

    return { entries, total };
  }

  async deleteEntry(companyId: string, entryId: string): Promise<void> {
    const entry = await this.getEntry(companyId, entryId);

    if (!entry) {
      throw new NotFoundError('سند یافت نشد');
    }

    if (entry.isPosted) {
      throw new ValidationError('نمی‌توانید سند ثبت شده را حذف کنید');
    }

    await prisma.journalEntry.delete({
      where: { id: entryId },
    });
  }

  async getAccountBalance(companyId: string, accountId: string, asOfDate?: Date): Promise<{ balance: number; currency: string }> {
    const where: any = {
      companyId,
      lines: {
        some: {
          accountId,
        },
      },
      isPosted: true,
    };

    if (asOfDate) {
      where.date = { lte: asOfDate };
    }

    const result = await prisma.journalEntry.aggregate({
      where,
      _sum: {
        totalDebit: true,
        totalCredit: true,
      },
    });

    const debit = result._sum.totalDebit || 0;
    const credit = result._sum.totalCredit || 0;

    const account = await prisma.account.findUnique({ where: { id: accountId } });
    const balance = account?.type === 'ASSET' || account?.type === 'EXPENSE'
      ? Number(debit) - Number(credit)
      : Number(credit) - Number(debit);

    return { balance, currency: 'USD' };
  }

  private async createAiSuggestionForEntry(entry: any): Promise<void> {
    const allAccounts = await prisma.account.findMany({
      where: { companyId: entry.companyId },
    });

    const unclassifiedLines = entry.lines.filter((line: any) => line.description && line.description.length > 10);

    if (unclassifiedLines.length > 0) {
      const suggestions = await this.sendToAiForCategorization(entry, allAccounts);

      if (suggestions && suggestions.length > 0) {
        for (const suggestion of suggestions) {
          await prisma.aiSuggestion.create({
            data: {
              companyId: entry.companyId,
              type: 'CATEGORIZATION',
              title: 'پیشنهاد دسته‌بندی هوشمند',
              description: suggestion.explanation,
              data: { suggestion, entryId: entry.id },
              confidence: suggestion.confidence * 100,
            },
          });
        }
      }
    }
  }

  private async sendToAiForCategorization(entry: JournalEntry, accounts: any[]): Promise<any[]> {
    return [];
  }
}

export const journalService = new JournalService();
