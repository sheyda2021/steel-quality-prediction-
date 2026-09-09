import { JournalService } from '../journal.service';
import { prisma } from '@db';

jest.mock('@db', () => ({
  prisma: {
    journalEntry: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      aggregate: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    account: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    aiSuggestion: {
      create: jest.fn(),
    },
  },
}));

describe('JournalService', () => {
  let journalService: JournalService;

  beforeEach(() => {
    journalService = new JournalService();
    jest.clearAllMocks();
  });

  describe('createJournalEntry', () => {
    it('should throw ValidationError for unbalanced entries', async () => {
      await expect(journalService.createJournalEntry({
        date: new Date(),
        description: 'Test entry',
        createdBy: 'company-1',
        lines: [
          { accountId: 'acc-1', debit: 100, credit: 0 },
          { accountId: 'acc-2', debit: 50, credit: 0 },
        ],
      })).rejects.toThrow('جمع بدهی و بستانی باید برابر باشند');
    });

    it('should create a balanced journal entry', async () => {
      (prisma.account.findFirst as jest.Mock).mockResolvedValue({ id: 'acc-1', type: 'ASSET' });
      (prisma.account.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.journalEntry.count as jest.Mock).mockResolvedValue(0);
      (prisma.journalEntry.create as jest.Mock).mockResolvedValue({
        id: 'entry-1',
        entryNumber: '2024-01-0001',
        companyId: 'company-1',
        date: new Date(),
        description: 'Test entry',
        totalDebit: 100,
        totalCredit: 100,
        isPosted: false,
        lines: [
          { id: 'line-1', accountId: 'acc-1', debit: 100, credit: 0 },
          { id: 'line-2', accountId: 'acc-2', debit: 0, credit: 100 },
        ],
      });

      const result = await journalService.createJournalEntry({
        date: new Date(),
        description: 'Test entry',
        createdBy: 'company-1',
        lines: [
          { accountId: 'acc-1', debit: 100, credit: 0 },
          { accountId: 'acc-2', debit: 0, credit: 100 },
        ],
      });

      expect(result.entryNumber).toMatch(/^2024-01-/);
      expect(prisma.journalEntry.create).toHaveBeenCalled();
    });
  });
});
