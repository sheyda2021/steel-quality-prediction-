import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from '@config';
import { errorHandler, notFound } from '@middleware/error.middleware';
import routes from '@routes/index';
import { logger } from '@utils/logger';

const app: Express.Application = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'تعداد درخواست بیش از حد',
});
app.use(limiter);

app.use('/api/v1', routes);

app.use(notFound);
app.use(errorHandler);

const startServer = async (): Promise<void> => {
  try {
    app.listen(config.port, () => {
      logger.info(`سرور در حال اجرا روی پورت ${config.port}`);
      logger.info(`محیط: ${config.nodeEnv}`);
    });
  } catch (error) {
    logger.error('خطا در شروع سرور', error);
    process.exit(1);
  }
};

startServer();

export default app;
