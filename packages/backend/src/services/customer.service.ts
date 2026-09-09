import { prisma } from '@db';
import { Customer } from '@prisma/client';
import { NotFoundError, ConflictError } from '@utils/errors';
import { generateCode } from '@utils/cuid';

interface CustomerInput {
  code?: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
  category?: string;
  creditLimit?: number;
}

export class CustomerService {
  async create(data: CustomerInput & { companyId: string }): Promise<Customer> {
    const code = data.code || generateCode('CUST-', 6);

    const existing = await prisma.customer.findFirst({
      where: { companyId: data.companyId, OR: [{ code }, { name: data.name }] },
    });

    if (existing) {
      throw new ConflictError('مشتری با این کد یا نام قبلاً ثبت شده');
    }

    return prisma.customer.create({
      data: {
        companyId: data.companyId,
        code,
        name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        taxId: data.taxId,
        category: data.category,
        creditLimit: data.creditLimit || 0,
      },
    });
  }

  async get(companyId: string, id: string): Promise<Customer | null> {
    return prisma.customer.findFirst({ where: { id, companyId } });
  }

  async getAll(companyId: string, search?: string): Promise<Customer[]> {
    const where: any = { companyId, isActive: true };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }
    return prisma.customer.findMany({ where, orderBy: { name: 'asc' } });
  }

  async update(companyId: string, id: string, data: Partial<CustomerInput>): Promise<Customer> {
    const customer = await this.get(companyId, id);
    if (!customer) throw new NotFoundError('مشتری یافت نشد');

    return prisma.customer.update({
      where: { id },
      data,
    });
  }

  async delete(companyId: string, id: string): Promise<void> {
    const customer = await this.get(companyId, id);
    if (!customer) throw new NotFoundError('مشتری یافت نشد');

    await prisma.customer.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export const customerService = new CustomerService();
