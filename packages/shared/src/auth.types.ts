export interface AuthPayload {
  userId: string;
  companyId: string;
  email: string;
  role: string;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
  companyId?: string;
}

export interface RegisterData {
  companyName: string;
  companyLegalName: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface RefreshTokenData {
  refreshToken: string;
}
