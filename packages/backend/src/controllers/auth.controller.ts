import { Request, Response, NextFunction } from 'express';
import { authService } from '@services/auth.service';
import { LoginCredentials, RegisterData } from '@shared';

export class AuthController {
  async register(req: Request<{}, {}, RegisterData>, res: Response, next: NextFunction): Promise<void> {
    try {
      const tokens = await authService.register(req.body);

      res.status(201).json({
        success: true,
        message: 'ثبت نام موفقیت‌آمیز',
        data: tokens,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request<{}, {}, LoginCredentials>, res: Response, next: NextFunction): Promise<void> {
    try {
      const tokens = await authService.login(req.body);

      res.json({
        success: true,
        message: 'ورود موفقیت‌آمیز',
        data: tokens,
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshToken(refreshToken);

      res.json({
        success: true,
        message: 'توکن تازه شد',
        data: tokens,
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const { oldPassword, newPassword } = req.body;

      await authService.changePassword(userId, oldPassword, newPassword);

      res.json({
        success: true,
        message: 'رمز عبور با موفقیت تغییر یافت',
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const profile = await authService.getUserProfile(userId);

      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
