import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@middleware/auth.middleware';
import { prisma } from '@db';

export const tenantIsolation = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user?.companyId) {
    next();
    return;
  }

  const company = await prisma.company.findUnique({
    where: { id: req.user.companyId, isActive: true },
  });

  if (!company) {
    next();
    return;
  }

  req.companyId = company.id;
  next();
};

export const checkSubscription = (...tiers: string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.companyId) {
      next();
      return;
    }

    const company = await prisma.company.findUnique({
      where: { id: req.user.companyId },
    });

    if (!company || !tiers.includes(company.subscriptionTier)) {
      res.status(403).json({
        success: false,
        message: 'اشتراک شما این قابلیت را پشتیبانی نمی‌کند',
      });
      return;
    }

    next();
  };
};
