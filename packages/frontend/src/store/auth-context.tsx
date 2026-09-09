import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api, { setAuthToken, clearAuth } from '../services/api';
import { User, Company, AuthPayload } from '@shared';

interface AuthContextType {
  user: User | null;
  company: Company | null;
  loading: boolean;
  login: (email: string, password: string, companyId?: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async (): Promise<void> => {
      const token = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        setAuthToken(token);
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);

        try {
          const response = await api.get(`/auth/profile/${parsedUser.id}`);
          setUser(response.data.data);
        } catch {
          clearAuth();
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string, companyId?: string): Promise<void> => {
    const response = await api.post('/auth/login', { email, password, companyId });
    const data = response.data.data;

    setAuthToken(data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);

    const profileResponse = await api.get(`/auth/profile/${data.accessToken}`);
    const tokenPayload = JSON.parse(atob(data.accessToken.split('.')[1])) as AuthPayload;

    const userObj: User = {
      id: tokenPayload.userId,
      companyId: tokenPayload.companyId,
      email: tokenPayload.email,
      role: tokenPayload.role as any,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      firstName: '',
      lastName: '',
    };

    setUser(userObj);
    localStorage.setItem('user', JSON.stringify(userObj));
  };

  const register = async (data: any): Promise<void> => {
    const response = await api.post('/auth/register', data);
    const tokens = response.data.data;
    setAuthToken(tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  };

  const refreshAccessToken = async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return;

    const response = await api.post('/auth/refresh-token', { refreshToken });
    const data = response.data.data;
    setAuthToken(data.accessToken);
    localStorage.setItem('accessToken', data.accessToken);
  };

  const logout = (): void => {
    clearAuth();
    setUser(null);
    setCompany(null);
  };

  return (
    <AuthContext.Provider value={{ user, company, loading, login, register, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};
