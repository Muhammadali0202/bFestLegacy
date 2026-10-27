'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<{ success: boolean; error?: string; user?: User }>;
  register: (data: {
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
    adminKey?: string;
    companyOrFirm?: string;
    investmentCapacity?: string;
    bio?: string;
    teamName?: string;
    institution?: string;
    judgePin?: string;
    judgeDesignation?: string;
  }) => Promise<{ success: boolean; error?: string; message?: string; user?: User }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem('bf27_user', JSON.stringify(data.user));
          return;
        }
      }
      // If server returned 401, check localStorage as fallback in dev
      const local = localStorage.getItem('bf27_user');
      if (local) {
        try {
          setUser(JSON.parse(local));
        } catch (_) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (e) {
      const local = localStorage.getItem('bf27_user');
      if (local) {
        try {
          setUser(JSON.parse(local));
        } catch (_) {}
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string, role?: UserRole) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('bf27_user', JSON.stringify(data.user));
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error || 'Login failed.' };
      }
    } catch (err: any) {
      return { success: false, error: 'Connection error. Please try again.' };
    }
  };

  const register = async (data: any) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();

      if (resData.success && resData.user) {
        setUser(resData.user);
        localStorage.setItem('bf27_user', JSON.stringify(resData.user));
        return { success: true, user: resData.user, message: resData.message };
      } else {
        return { success: false, error: resData.error || 'Registration failed.' };
      }
    } catch (err) {
      return { success: false, error: 'Connection error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (_) {}
    setUser(null);
    localStorage.removeItem('bf27_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
