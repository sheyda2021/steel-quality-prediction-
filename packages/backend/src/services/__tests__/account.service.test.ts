import { AccountService } from '../account.service';
import { prisma } from '@db';

jest.mock('@db', () => ({
  prisma: {
    account: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('AccountService', () => {
  let accountService: AccountService;

  beforeEach(() => {
    accountService = new AccountService();
    jest.clearAllMocks();
  });

  describe('createAccount', () => {
    it('should create an account with auto-generated code', async () => {
      const input = {
        companyId: 'test-company',
        name: 'نقد',
        type: 'ASSET' as const,
      };

      (prisma.account.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.account.create as jest.Mock).mockResolvedValue({
        id: '1',
        code: 'ACC-ABCD12',
        ...input,
        isActive: true,
      });

      const result = await accountService.createAccount(input);

      expect(prisma.account.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          companyId: 'test-company',
          name: 'نقد',
          type: 'ASSET',
          isActive: true,
        }),
      });
      expect(result.code).toMatch(/^ACC-/);
    });

    it('should return error if code already exists', async () => {
      (prisma.account.findFirst as jest.Mock).mockResolvedValue({
        id: 'existing',
        code: 'ACC-TEST',
      });

      await expect(accountService.createAccount({
        companyId: 'test-company',
        code: 'ACC-TEST',
        name: 'Test',
        type: 'ASSET' as const,
      })).rejects.toThrow('کد حساب ACC-TEST قبلاً ثبت شده');
    });
  });

  describe('getAccount', () => {
    it('should return null for non-existent account', async () => {
      (prisma.account.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await accountService.getAccount('company', 'non-existent');
      expect(result).toBeNull();
    });
  });
});
