export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class AuthError extends AppError {
  constructor(message: string = 'خطای احراز هویت') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'دسترسی رد شد') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'یافت نشد') {
    super(message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'اعتبارسنجی نامعتبر') {
    super(message, 400);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'تعارض داده') {
    super(message, 409);
  }
}
