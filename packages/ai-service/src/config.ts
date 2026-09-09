import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.AI_SERVICE_PORT || '4001', 10),
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  modelName: process.env.AI_MODEL_NAME || 'gpt-4o-mini',
  maxTokens: parseInt(process.env.AI_MAX_TOKENS || '4000', 10),
  temperature: parseFloat(process.env.AI_TEMPERATURE || '0.3'),
};
