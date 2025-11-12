'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  name: string;
  user_type: 'individual' | 'business';
  phone?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  register: (email: string, password: string, name: string, userType: string, phone?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (name?: string, phone?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        if (token) {
          api.setToken(token);
          try {
            const response = (await api.getCurrentUser()) as any;
            setUser(response.user);
          } catch (err) {
            // Token is invalid or expired, clear it
            console.warn('Token validation failed, clearing auth');
            api.clearToken();
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const register = async (email: string, password: string, name: string, userType: string, phone?: string) => {
    setError(null);
    try {
      const response = (await api.registerUser(email, password, name, userType, phone)) as any;

      // Backend returns accessToken in the response
      const token = response.accessToken || response.token;
      if (!token) {
        throw new Error('No token returned from server');
      }

      // api.registerUser already calls setToken internally
      console.log('Token set in API client and localStorage');

      setUser(response.user);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      console.log('AuthContext.login called for:', email);
      const response = (await api.loginUser(email, password)) as any;
      console.log('Login response:', response);

      // Backend returns accessToken in the response
      const token = response.accessToken || response.token;
      console.log('Token from response:', token);

      if (!token) {
        throw new Error('No token returned from server');
      }

      // api.loginUser already calls setToken internally, but ensure it's saved
      console.log('Token set in API client and localStorage');

      setUser(response.user);
      console.log('User set in context:', response.user);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    }
  };

  const logout = () => {
    api.clearToken();
    setUser(null);
    setError(null);
  };

  const updateProfile = async (name?: string, phone?: string) => {
    setError(null);
    try {
      const response = (await api.updateUserProfile(name, phone)) as any;
      setUser(response.user);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Profile update failed';
      setError(errorMessage);
      throw err;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
