export enum AccountType {
  Asset = 'ASSET',
  Liability = 'LIABILITY',
  Equity = 'EQUITY',
  Revenue = 'REVENUE',
  Expense = 'EXPENSE',
}

export enum AccountCategory {
  CurrentAssets = 'CURRENT_ASSETS',
  FixedAssets = 'FIXED_ASSETS',
  CurrentLiabilities = 'CURRENT_LIABILITIES',
  LongTermLiabilities = 'LONG_TERM_LIABILITIES',
  OperatingRevenue = 'OPERATING_REVENUE',
  OperatingExpense = 'OPERATING_EXPENSE',
  CostOfGoodsSold = 'COST_OF_GOODS_SOLD',
}

export enum TransactionType {
  JournalEntry = 'JOURNAL_ENTRY',
  Payment = 'PAYMENT',
  Receipt = 'RECEIPT',
  Transfer = 'TRANSFER',
  Invoice = 'INVOICE',
  Bill = 'BILL',
}

export enum InvoiceStatus {
  Draft = 'DRAFT',
  Posted = 'POSTED',
  Paid = 'PAID',
  Cancelled = 'CANCELLED',
}

export enum BillStatus {
  Draft = 'DRAFT',
  Posted = 'POSTED',
  Paid = 'PAID',
  Cancelled = 'CANCELLED',
}

export enum ReportType {
  BalanceSheet = 'BALANCE_SHEET',
  IncomeStatement = 'INCOME_STATEMENT',
  CashFlow = 'CASH_FLOW',
  TrialBalance = 'TRIAL_BALANCE',
  GeneralLedger = 'GENERAL_LEDGER',
}

export enum AiSuggestionType {
  Categorization = 'CATEGORIZATION',
  Forecasting = 'FORECASTING',
  Anomaly = 'ANOMALY',
  Reconciliation = 'RECONCILIATION',
  TaxOptimization = 'TAX_OPTIMIZATION',
}

export enum UserRole {
  Admin = 'ADMIN',
  Manager = 'MANAGER',
  Accountant = 'ACCOUNTANT',
  Viewer = 'VIEWER',
}

export enum SubscriptionTier {
  Free = 'FREE',
  Basic = 'BASIC',
  Pro = 'PRO',
  Enterprise = 'ENTERPRISE',
}
