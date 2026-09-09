import { Request, Response, NextFunction } from 'express';
import { AppError } from '@utils/errors';
import { config } from '@config';

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'خطای سرور';

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'خطا در اعتبارسنجی داده';
  } else if (error.name === 'PrismaClientKnownRequestError') {
    statusCode = 400;
    message = 'خطا در دیتابیس';
  }

  if (config.nodeEnv === 'development' && statusCode === 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(config.nodeEnv === 'development' && { stack: error.stack }),
  });
};

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `مسیر ${req.originalUrl} یافت نشد`,
  });
};
