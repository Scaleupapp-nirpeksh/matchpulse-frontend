'use client';

import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { User, AuthResponse } from '@/types/user';
import {
  loginEmail,
  loginPhone,
  registerEmail,
  getProfile,
  logout as apiLogout,
} from '@/lib/api/auth';
import type { RegisterEmailData } from '@/lib/api/auth';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithPhone: (phone: string, otp: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

function storeTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  // Also set as cookie for middleware route protection
  document.cookie = `accessToken=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  document.cookie = 'accessToken=; path=/; max-age=0';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setUser(null);
        return;
      }
      const profile = (await getProfile()) as unknown as User;
      setUser(profile);
    } catch {
      setUser(null);
      clearTokens();
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const res = (await loginEmail({ email, password })) as unknown as AuthResponse;
    storeTokens(res.accessToken, res.refreshToken);
    setUser(res.user);
  }, []);

  const loginWithPhone = useCallback(async (phone: string, otp: string) => {
    const res = (await loginPhone({ phone, code: otp })) as unknown as AuthResponse;
    storeTokens(res.accessToken, res.refreshToken);
    setUser(res.user);
  }, []);

  const register = useCallback(
    async (data: { email: string; password: string; name: string; phone?: string }) => {
      const payload: RegisterEmailData = {
        email: data.email,
        password: data.password,
        name: data.name,
        phone: data.phone,
      };
      const res = (await registerEmail(payload)) as unknown as AuthResponse;
      storeTokens(res.accessToken, res.refreshToken);
      setUser(res.user);
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Ignore logout API errors
    } finally {
      setUser(null);
      clearTokens();
    }
  }, []);

  const setTokens = useCallback((accessToken: string, refreshToken: string) => {
    storeTokens(accessToken, refreshToken);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        loginWithPhone,
        register,
        logout,
        refreshUser,
        setTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
