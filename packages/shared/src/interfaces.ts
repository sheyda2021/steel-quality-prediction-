import { AccountType, AccountCategory, TransactionType, InvoiceStatus, BillStatus, ReportType, AiSuggestionType, UserRole, SubscriptionTier } from './enums';

export interface Company {
  id: string;
  name: string;
  legalName: string;
  taxId: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  fiscalYearStart: string;
  subscriptionTier: SubscriptionTier;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  companyId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Account {
  id: string;
  companyId: string;
  code: string;
  name: string;
  type: AccountType;
  category: AccountCategory;
  description: string;
  parentId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChartOfAccount {
  id: string;
  companyId: string;
  name: string;
  code: string;
  type: AccountType;
  category: AccountCategory;
  parentId: string | null;
  isActive: boolean;
}

export interface JournalEntryLine {
  id: string;
  entryId: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  description: string;
  debit: number;
  credit: number;
  currency: string;
  createdAt: Date;
}

export interface JournalEntry {
  id: string;
  companyId: string;
  entryNumber: string;
  date: Date;
  description: string;
  type: TransactionType;
  referenceId: string | null;
  totalDebit: number;
  totalCredit: number;
  currency: string;
  isPosted: boolean;
  createdBy: string;
  approvedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  lines: JournalEntryLine[];
}

export interface Customer {
  id: string;
  companyId: string;
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  taxId: string;
  category: string;
  creditLimit: number;
  balance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Supplier {
  id: string;
  companyId: string;
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  taxId: string;
  category: string;
  creditLimit: number;
  balance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  accountId: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  discount: number;
}

export interface Invoice {
  id: string;
  companyId: string;
  invoiceNumber: string;
  customerId: string;
  date: Date;
  dueDate: Date;
  status: InvoiceStatus;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  paidAmount: number;
  currency: string;
  description: string;
  items: InvoiceItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BillItem {
  id: string;
  billId: string;
  description: string;
  accountId: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  discount: number;
}

export interface Bill {
  id: string;
  companyId: string;
  billNumber: string;
  supplierId: string;
  date: Date;
  dueDate: Date;
  status: BillStatus;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  paidAmount: number;
  currency: string;
  description: string;
  items: BillItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BankAccount {
  id: string;
  companyId: string;
  name: string;
  bankName: string;
  accountNumber: string;
  iban: string;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  companyId: string;
  date: Date;
  description: string;
  amount: number;
  currency: string;
  type: TransactionType;
  accountId: string;
  partyId: string | null;
  referenceId: string | null;
  isCleared: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AiSuggestion {
  id: string;
  companyId: string;
  type: AiSuggestionType;
  title: string;
  description: string;
  data: Record<string, any>;
  confidence: number;
  isApplied: boolean;
  createdAt: Date;
  expiresAt: Date | null;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BalanceSheetData {
  assets: { current: number; fixed: number; total: number };
  liabilities: { current: number; longTerm: number; total: number };
  equity: number;
  totalAssets: number;
  totalLiabilitiesAndEquity: number;
  date: Date;
}

export interface IncomeStatementData {
  revenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  operatingExpenses: number;
  operatingIncome: number;
  otherIncome: number;
  otherExpenses: number;
  netIncome: number;
  startDate: Date;
  endDate: Date;
}
