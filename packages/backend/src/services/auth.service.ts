import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '@config';
import { prisma } from '@db';
import { AuthPayload, TokenPair, LoginCredentials, RegisterData } from '@shared';
import { AuthError, ConflictError, NotFoundError } from '@utils/errors';
import { generateId } from '@utils/cuid';

export class AuthService {
  private generateAccessToken(payload: AuthPayload): string {
    return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn as any });
  }

  private generateRefreshToken(payload: AuthPayload): string {
    return jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: config.jwtRefreshExpiresIn as any });
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  async register(data: RegisterData): Promise<TokenPair> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('کاربر با این ایمیل قبلاً ثبت شده');
    }

    const companyId = generateId();
    const company = await prisma.company.create({
      data: {
        id: companyId,
        name: data.companyName,
        legalName: data.companyLegalName,
        currency: 'USD',
      },
    });

    const hashedPassword = await this.hashPassword(data.password);
    const userId = generateId();

    const user = await prisma.user.create({
      data: {
        id: userId,
        companyId: company.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    const tokens = this.generateTokens(user, company);
    return tokens;
  }

  async login(credentials: LoginCredentials): Promise<TokenPair> {
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
      include: { company: true },
    });

    if (!user) {
      throw new AuthError('ایمیل یا رمز عبور نادرست');
    }

    if (!user.isActive) {
      throw new AuthError('حساب کاربری غیرفعال است');
    }

    if (credentials.companyId && user.companyId !== credentials.companyId) {
      throw new AuthError('دسترسی غیرمجاز');
    }

    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
    if (!isPasswordValid) {
      throw new AuthError('ایمیل یا رمز عبور نادرست');
    }

    return this.generateTokens(user, user.company);
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as AuthPayload;

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { company: true },
      });

      if (!user || !user.isActive) {
        throw new AuthError('رفرش توکن نامعتبر');
      }

      return this.generateTokens(user, user.company);
    } catch (error) {
      throw new AuthError('رفرش توکن نامعتبر یا منقضی شده');
    }
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('کاربر یافت نشد');
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new AuthError('رمز عبور فعلی نادرست');
    }

    const hashedPassword = await this.hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  private generateTokens(user: any, company: any): TokenPair {
    const payload: AuthPayload = {
      userId: user.id,
      companyId: user.companyId,
      email: user.email,
      role: user.role,
    };

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
      expiresAt,
    };
  }

  async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        companyId: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('کاربر یافت نشد');
    }

    return user;
  }
}

export const authService = new AuthService();
