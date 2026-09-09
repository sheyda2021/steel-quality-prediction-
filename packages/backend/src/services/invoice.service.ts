import { prisma } from '@db';
import { Invoice, InvoiceItem, InvoiceStatus, Prisma } from '@prisma/client';
import { NotFoundError, ValidationError } from '@utils/errors';
import { generateCode } from '@utils/cuid';

interface InvoiceItemInput {
  description: string;
  accountId: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount?: number;
}

interface InvoiceInput {
  invoiceNumber?: string;
  customerId: string;
  date: Date;
  dueDate: Date;
  items: InvoiceItemInput[];
  currency?: string;
  description?: string;
}

export class InvoiceService {
  async create(data: InvoiceInput & { companyId: string }): Promise<Invoice> {
    const customer = await prisma.customer.findFirst({
      where: { id: data.customerId, companyId: data.companyId },
    });
    if (!customer) throw new NotFoundError('مشتری یافت نشد');

    const invoiceNumber = data.invoiceNumber || generateCode('INV-', 8);

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

    const invoice = await prisma.invoice.create({
      data: {
        companyId: data.companyId,
        invoiceNumber,
        customerId: data.customerId,
        date: data.date,
        dueDate: data.dueDate,
        status: InvoiceStatus.DRAFT,
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
      include: { items: true, customer: true },
    });

    await this.createJournalEntry(invoice);

    return invoice;
  }

  private async createJournalEntry(invoice: any): Promise<void> {
    const revenueAccount = await prisma.account.findFirst({
      where: { companyId: invoice.companyId, type: 'REVENUE', isActive: true },
    });

    const accountsReceivable = await prisma.account.findFirst({
      where: { companyId: invoice.companyId, type: 'ASSET', category: 'CURRENT_ASSETS', isActive: true },
    });

    if (revenueAccount && accountsReceivable) {
      await prisma.journalEntry.create({
        data: {
          companyId: invoice.companyId,
          entryNumber: `ACC-${invoice.invoiceNumber}`,
          date: invoice.date,
          description: `فاکتور ${invoice.invoiceNumber} - ${invoice.customer?.name}`,
          type: 'INVOICE',
          referenceId: invoice.id,
          totalDebit: invoice.total,
          totalCredit: invoice.total,
          currency: invoice.currency,
          isPosted: true,
          createdBy: invoice.companyId,
          lines: {
            create: [
              {
                accountId: revenueAccount.id,
                debit: 0,
                credit: invoice.total,
                description: `درآمد فاکتور ${invoice.invoiceNumber}`,
              },
              {
                accountId: accountsReceivable.id,
                debit: invoice.total,
                credit: 0,
                description: `دریافتی از ${invoice.customer?.name}`,
              },
            ],
          },
        },
      });
    }
  }

  async get(companyId: string, id: string): Promise<Invoice | null> {
    return prisma.invoice.findFirst({
      where: { id, companyId },
      include: { items: true, customer: true },
    });
  }

  async getAll(companyId: string, filters?: {
    status?: InvoiceStatus;
    customerId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Invoice[]> {
    const where: any = { companyId };
    if (filters?.status) where.status = filters.status;
    if (filters?.customerId) where.customerId = filters.customerId;
    if (filters?.startDate) where.date = { gte: filters.startDate };
    if (filters?.endDate) where.date = { ...where.date, lte: filters.endDate };

    return prisma.invoice.findMany({
      where,
      include: { items: true, customer: true },
      orderBy: { date: 'desc' },
    });
  }

  async update(companyId: string, id: string, data: Partial<Invoice>): Promise<Invoice> {
    const invoice = await this.get(companyId, id);
    if (!invoice) throw new NotFoundError('فاکتور یافت نشد');

    return prisma.invoice.update({
      where: { id },
      data,
      include: { items: true, customer: true },
    });
  }

  async post(invoiceId: string): Promise<Invoice> {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId }, include: { customer: true } });
    if (!invoice) throw new NotFoundError('فاکتور یافت نشد');

    if (invoice.status === InvoiceStatus.PAID) {
      throw new ValidationError('فاکتور قبلاً پرداخت شده است');
    }

    return prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: InvoiceStatus.POSTED },
    });
  }

  async makePayment(invoiceId: string, amount: number): Promise<Invoice> {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId }, include: { customer: true } });
    if (!invoice) throw new NotFoundError('فاکتور یافت نشد');

    const newPaidAmount = Number(invoice.paidAmount) + amount;
    const status = newPaidAmount >= Number(invoice.total) ? InvoiceStatus.PAID : InvoiceStatus.POSTED;

    return prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount: new Prisma.Decimal(newPaidAmount),
        status,
      },
    });
  }

  async cancel(companyId: string, id: string): Promise<Invoice> {
    const invoice = await this.get(companyId, id);
    if (!invoice) throw new NotFoundError('فاکتور یافت نشد');

    if (invoice.status === InvoiceStatus.PAID) {
      throw new ValidationError('نمی‌توانید فاکتور پرداخت شده را لغو کنید');
    }

    return prisma.invoice.update({
      where: { id },
      data: { status: InvoiceStatus.CANCELLED },
    });
  }

  async getCustomerBalance(companyId: string, customerId: string): Promise<number> {
    const result = await prisma.invoice.aggregate({
      where: {
        companyId,
        customerId,
        status: { in: [InvoiceStatus.POSTED, InvoiceStatus.PAID] },
      },
      _sum: { total: true, paidAmount: true },
    });

    const total = Number(result._sum.total) || 0;
    const paid = Number(result._sum.paidAmount) || 0;
    return total - paid;
  }
}

export const invoiceService = new InvoiceService();
