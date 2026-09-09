import { config } from '@config';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const getTimestamp = (): string => new Date().toISOString();

const log = (level: LogLevel, message: string, data?: any): void => {
  const timestamp = getTimestamp();
  const color = colors[level === 'error' ? 'red' : level === 'warn' ? 'yellow' : level === 'info' ? 'green' : 'blue'];
  const dataStr = data ? ` ${JSON.stringify(data)}` : '';
  console.log(`${color}[${timestamp}] [${level.toUpperCase()}] ${message}${dataStr}${colors.reset}`);
};

export const logger = {
  info: (message: string, data?: any) => log('info', message, data),
  warn: (message: string, data?: any) => log('warn', message, data),
  error: (message: string, data?: any) => log('error', message, data),
  debug: (message: string, data?: any) => config.nodeEnv === 'development' ? log('debug', message, data) : undefined,
};
