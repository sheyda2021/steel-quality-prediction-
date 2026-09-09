import { prisma } from '@db';
import { Bill, BillItem, BillStatus, Prisma } from '@prisma/client';
import { NotFoundError, ValidationError } from '@utils/errors';
import { generateCode } from '@utils/cuid';

interface BillItemInput {
  description: string;
  accountId: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount?: number;
}

interface BillInput {
  billNumber?: string;
  supplierId: string;
  date: Date;
  dueDate: Date;
  items: BillItemInput[];
  currency?: string;
  description?: string;
}

export class BillService {
  async create(data: BillInput & { companyId: string }): Promise<Bill> {
    const supplier = await prisma.supplier.findFirst({
      where: { id: data.supplierId, companyId: data.companyId },
    });
    if (!supplier) throw new NotFoundError('تامین‌کننده یافت نشد');

    const billNumber = data.billNumber || generateCode('BILL-', 8);

    let subtotal = 0;
    let taxTotal = 0;
    let discountTotal = 0;

    for (const item of data.items) {
      const itemTotal = item.quantity * item.unitPrice;
      const taxAmount = itemTotal * (item.taxRate / 100);
      const discount = item.discount || 0;

      subtotal += itemTotal;
      taxTotal += taxAmount;
      discountTotal += discount;
    }

    const total = subtotal + taxTotal - discountTotal;

    const bill = await prisma.bill.create({
      data: {
        companyId: data.companyId,
        billNumber,
        supplierId: data.supplierId,
        date: data.date,
        dueDate: data.dueDate,
        status: BillStatus.DRAFT,
        subtotal: new Prisma.Decimal(subtotal),
        taxTotal: new Prisma.Decimal(taxTotal),
        discountTotal: new Prisma.Decimal(discountTotal),
        total: new Prisma.Decimal(total),
        currency: data.currency || 'USD',
        description: data.description,
        items: {
          create: data.items.map(item => {
            const itemTotal = item.quantity * item.unitPrice;
            const taxAmount = itemTotal * (item.taxRate / 100);
            const discount = item.discount || 0;
            const total = itemTotal + taxAmount - discount;

            return {
              description: item.description,
              accountId: item.accountId,
              quantity: new Prisma.Decimal(item.quantity),
              unitPrice: new Prisma.Decimal(item.unitPrice),
              taxRate: new Prisma.Decimal(item.taxRate),
              taxAmount: new Prisma.Decimal(taxAmount),
              total: new Prisma.Decimal(total),
              discount: new Prisma.Decimal(discount),
            };
          }),
        },
      },
      include: { items: true, supplier: true },
    });

    return bill;
  }

  private async createJournalEntry(bill: any): Promise<void> {
    const expenseAccount = await prisma.account.findFirst({
      where: { companyId: bill.companyId, type: 'EXPENSE', isActive: true },
    });

    const accountsPayable = await prisma.account.findFirst({
      where: { companyId: bill.companyId, type: 'LIABILITY', category: 'CURRENT_LIABILITIES', isActive: true },
    });

    if (expenseAccount && accountsPayable) {
      const items = await prisma.billItem.findMany({ where: { billId: bill.id } });

      for (const item of items) {
        await prisma.journalEntry.create({
          data: {
            companyId: bill.companyId,
            entryNumber: `ACC-${bill.billNumber}`,
            date: bill.date,
            description: `هزینه ${bill.billNumber} - ${bill.supplier?.name}`,
            type: 'BILL',
            referenceId: bill.id,
            totalDebit: item.total,
            totalCredit: item.total,
            currency: bill.currency,
            isPosted: true,
            createdBy: bill.companyId,
            lines: {
              create: [
                {
                  accountId: item.accountId,
                  debit: item.total,
                  credit: 0,
                  description: `${item.description} - ${bill.supplier?.name}`,
                },
                {
                  accountId: accountsPayable.id,
                  debit: 0,
                  credit: item.total,
                  description: `بدهی به ${bill.supplier?.name}`,
                },
              ],
            },
          },
        });
      }
    }
  }

  async get(companyId: string, id: string): Promise<Bill | null> {
    return prisma.bill.findFirst({
      where: { id, companyId },
      include: { items: true, supplier: true },
    });
  }

  async getAll(companyId: string, filters?: {
    status?: BillStatus;
    supplierId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Bill[]> {
    const where: any = { companyId };
    if (filters?.status) where.status = filters.status;
    if (filters?.supplierId) where.supplierId = filters.supplierId;
    if (filters?.startDate) where.date = { gte: filters.startDate };
    if (filters?.endDate) where.date = { ...where.date, lte: filters.endDate };

    return prisma.bill.findMany({
      where,
      include: { items: true, supplier: true },
      orderBy: { date: 'desc' },
    });
  }

  async update(companyId: string, id: string, data: Partial<Bill>): Promise<Bill> {
    const bill = await this.get(companyId, id);
    if (!bill) throw new NotFoundError('فاکتور یافت نشد');

    return prisma.bill.update({
      where: { id },
      data,
      include: { items: true, supplier: true },
    });
  }

  async post(billId: string): Promise<Bill> {
    const bill = await prisma.bill.findUnique({ where: { id: billId }, include: { supplier: true } });
    if (!bill) throw new NotFoundError('صورتحساب یافت نشد');

    if (bill.status === BillStatus.PAID) {
      throw new ValidationError('صورتحساب قبلاً پرداخت شده است');
    }

    await this.createJournalEntry(bill);

    return prisma.bill.update({
      where: { id: billId },
      data: { status: BillStatus.POSTED },
    });
  }

  async makePayment(billId: string, amount: number): Promise<Bill> {
    const bill = await prisma.bill.findUnique({ where: { id: billId }, include: { supplier: true } });
    if (!bill) throw new NotFoundError('صورتحساب یافت نشد');

    const newPaidAmount = Number(bill.paidAmount) + amount;
    const status = newPaidAmount >= Number(bill.total) ? BillStatus.PAID : BillStatus.POSTED;

    return prisma.bill.update({
      where: { id: billId },
      data: {
        paidAmount: new Prisma.Decimal(newPaidAmount),
        status,
      },
    });
  }

  async cancel(companyId: string, id: string): Promise<Bill> {
    const bill = await this.get(companyId, id);
    if (!bill) throw new NotFoundError('صورتحساب یافت نشد');

    if (bill.status === BillStatus.PAID) {
      throw new ValidationError('نمی‌توانید صورتحساب پرداخت شده را لغو کنید');
    }

    return prisma.bill.update({
      where: { id },
      data: { status: BillStatus.CANCELLED },
    });
  }
}

export const billService = new BillService();
