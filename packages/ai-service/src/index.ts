import express from 'express';
import cors from 'cors';
import { categorizationEngine } from './engines/categorization.engine';
import { forecastingEngine } from './engines/forecasting.engine';
import { config } from './config';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ai-service', timestamp: new Date().toISOString() });
});

app.post('/categorize', async (req, res) => {
  try {
    const { description, amount, accounts } = req.body;
    const result = categorizationEngine.classifyTransaction(description, amount, accounts);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/forecast', async (req, res) => {
  try {
    const { transactions, days } = req.body;
    const forecast = await forecastingEngine.predictCashFlow(transactions, days || 30);
    res.json({ success: true, data: forecast });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/anomalies', async (req, res) => {
  try {
    const { transactions } = req.body;
    const anomalies = await forecastingEngine.detectAnomalies(transactions);
    res.json({ success: true, data: anomalies });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/tax-optimization', async (req, res) => {
  try {
    const { accounts, transactions } = req.body;
    const suggestions = await forecastingEngine.suggestTaxOptimizations(accounts, transactions);
    res.json({ success: true, data: suggestions });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/train', (req, res) => {
  try {
    const { trainingData } = req.body;
    categorizationEngine.addTrainingData(trainingData);
    res.json({ success: true, message: 'داده‌های آموزشی اضافه شد' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.listen(config.port, () => {
  console.log(`سرویس AI در حال اجرا روی پورت ${config.port}`);
});

export default app;
