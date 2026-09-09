import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@config';
import { AuthPayload } from '@shared';
import { AuthError, ForbiddenError } from '@utils/errors';
import { UserRole } from '@shared';

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
  companyId?: string;
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthError('توکن دسترسی ارائه نشده');
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthPayload;
    req.user = decoded;
    req.companyId = decoded.companyId;
    next();
  } catch (error) {
    throw new AuthError('توکن نامعتبر یا منقضی شده');
  }
};

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AuthError('احراز هویت لازم است');
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      throw new ForbiddenError('دسترسی شما به این عملیات اجازه داده نمی‌شود');
    }

    next();
  };
};

export const requireCompany = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user?.companyId) {
    throw new AuthError('شناسه شرکت یافت نشد');
  }
  req.companyId = req.user.companyId;
  next();
};
