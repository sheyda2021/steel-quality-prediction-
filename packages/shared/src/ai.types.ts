export interface AiConfig {
  modelName: string;
  maxTokens: number;
  temperature: number;
  apiKey: string;
  endpoint: string;
}

export interface TransactionClassification {
  accountId: string | null;
  category: string | null;
  confidence: number;
  explanation: string;
}

export interface CashFlowForecastPoint {
  date: string;
  predictedInflow: number;
  predictedOutflow: number;
  netCashFlow: number;
  confidenceLower: number;
  confidenceUpper: number;
}

export interface AnomalyDetectionResult {
  transactionId: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
}

export interface TaxOptimizationSuggestion {
  accountId: string;
  accountName: string;
  currentAmount: number;
  suggestedAmount: number;
  potentialSaving: number;
  explanation: string;
}

export interface AiInsight {
  id: string;
  type: 'forecasting' | 'anomaly' | 'optimization' | 'categorization';
  title: string;
  description: string;
  data: Record<string, any>;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}
