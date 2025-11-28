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
        const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

        console.log('[AuthContext.checkAuth] Token exists:', !!token);

        if (token && userStr) {
          // If token exists, trust it and set it in the API client
          api.setToken(token);
          const userData = JSON.parse(userStr);
          setUser(userData);
          console.log('[AuthContext.checkAuth] ✅ Restored user from localStorage:', userData.email);
        } else {
          console.log('[AuthContext.checkAuth] No token or user data found');
        }
      } catch (err) {
        console.error('[AuthContext.checkAuth] Auth check failed:', err);
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

      // Save token and user data to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', token);
        console.log('Token saved to localStorage as authToken');
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
          console.log('User saved to localStorage:', response.user.email);
        }
      }

      // Set token in API client
      api.setToken(token);
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

      // Save token and user data to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', token);
        console.log('Token saved to localStorage as authToken');
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
          console.log('User saved to localStorage:', response.user.email);
        }
      }

      // Set token in API client
      api.setToken(token);
      console.log('✅ Token and user saved to localStorage');

      setUser(response.user);
      console.log('✅ User set in context:', response.user.email);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    }
  };

  const logout = () => {
    api.clearToken();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
    }
    setUser(null);
    setError(null);
    console.log('Logged out and cleared all auth data');
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
