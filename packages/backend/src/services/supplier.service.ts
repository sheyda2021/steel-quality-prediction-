import { prisma } from '@db';
import { Supplier } from '@prisma/client';
import { NotFoundError, ConflictError } from '@utils/errors';
import { generateCode } from '@utils/cuid';

interface SupplierInput {
  code?: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
  category?: string;
  creditLimit?: number;
}

export class SupplierService {
  async create(data: SupplierInput & { companyId: string }): Promise<Supplier> {
    const code = data.code || generateCode('SUPP-', 6);

    const existing = await prisma.supplier.findFirst({
      where: { companyId: data.companyId, OR: [{ code }, { name: data.name }] },
    });

    if (existing) {
      throw new ConflictError('تامین‌کننده با این کد یا نام قبلاً ثبت شده');
    }

    return prisma.supplier.create({
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

  async get(companyId: string, id: string): Promise<Supplier | null> {
    return prisma.supplier.findFirst({ where: { id, companyId } });
  }

  async getAll(companyId: string, search?: string): Promise<Supplier[]> {
    const where: any = { companyId, isActive: true };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }
    return prisma.supplier.findMany({ where, orderBy: { name: 'asc' } });
  }

  async update(companyId: string, id: string, data: Partial<SupplierInput>): Promise<Supplier> {
    const supplier = await this.get(companyId, id);
    if (!supplier) throw new NotFoundError('تامین‌کننده یافت نشد');

    return prisma.supplier.update({
      where: { id },
      data,
    });
  }

  async delete(companyId: string, id: string): Promise<void> {
    const supplier = await this.get(companyId, id);
    if (!supplier) throw new NotFoundError('تامین‌کننده یافت نشد');

    await prisma.supplier.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export const supplierService = new SupplierService();
