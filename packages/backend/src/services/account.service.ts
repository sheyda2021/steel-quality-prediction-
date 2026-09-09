import { prisma } from '@db';
import { Account, AccountType, AccountCategory } from '@prisma/client';
import { NotFoundError, ConflictError, ValidationError } from '@utils/errors';
import { generateCode } from '@utils/cuid';

export class AccountService {
  async createAccount(data: {
    companyId: string;
    code?: string;
    name: string;
    type: AccountType;
    category?: AccountCategory;
    description?: string;
    parentId?: string;
  }): Promise<Account> {
    if (data.parentId) {
      const parent = await prisma.account.findFirst({
        where: { id: data.parentId, companyId: data.companyId },
      });
      if (!parent) {
        throw new NotFoundError('حساب والد یافت نشد');
      }
    }

    const code = data.code || generateCode('ACC-', 6);

    const existing = await prisma.account.findFirst({
      where: { companyId: data.companyId, code },
    });

    if (existing) {
      throw new ConflictError(`کد حساب ${code} قبلاً ثبت شده`);
    }

    return prisma.account.create({
      data: {
        companyId: data.companyId,
        code,
        name: data.name,
        type: data.type,
        category: data.category,
        description: data.description,
        parentId: data.parentId,
        isActive: true,
      },
    });
  }

  async getAccount(companyId: string, id: string): Promise<any> {
    return prisma.account.findFirst({
      where: { id, companyId },
      include: { parent: true, children: true },
    });
  }

  async getAccounts(companyId: string, filters?: {
    type?: AccountType;
    category?: AccountCategory;
    isActive?: boolean;
    search?: string;
  }): Promise<Account[]> {
    const where: any = { companyId };

    if (filters?.type) where.type = filters.type;
    if (filters?.category) where.category = filters.category;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { code: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.account.findMany({
      where,
      include: { parent: true, children: true },
      orderBy: { code: 'asc' },
    });
  }

  async updateAccount(companyId: string, id: string, data: Partial<Account>): Promise<Account> {
    const account = await this.getAccount(companyId, id);

    if (!account) {
      throw new NotFoundError('حساب یافت نشد');
    }

    return prisma.account.update({
      where: { id },
      data: {
        name: data.name ?? account.name,
        type: data.type ?? account.type,
        category: data.category ?? account.category,
        description: data.description ?? account.description,
        isActive: data.isActive ?? account.isActive,
      },
    });
  }

  async deleteAccount(companyId: string, id: string): Promise<void> {
    const account = await this.getAccount(companyId, id);

    if (!account) {
      throw new NotFoundError('حساب یافت نشد');
    }

    const hasChildren = account.children && account.children.length > 0;
    if (hasChildren) {
      throw new ValidationError('نمی‌توانید حساب دارای زیرحساب حذف کنید');
    }

    await prisma.account.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getChartOfAccounts(companyId: string): Promise<any> {
    const accounts = await this.getAccounts(companyId, { isActive: true });

    const buildTree = (accounts: Account[]): any[] => {
      const accountMap = new Map<string, any>();
      accounts.forEach(acc => {
        accountMap.set(acc.id, { ...acc, children: [], balance: 0 });
      });

      const tree: any[] = [];
      accounts.forEach(acc => {
        const node = accountMap.get(acc.id);
        if (acc.parentId && accountMap.has(acc.parentId)) {
          accountMap.get(acc.parentId).children.push(node);
        } else {
          tree.push(node);
        }
      });

      return tree;
    };

    return {
      accounts: buildTree(accounts),
      totalAccounts: accounts.length,
    };
  }
}

export const accountService = new AccountService();
