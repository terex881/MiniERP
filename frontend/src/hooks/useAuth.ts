'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { LoginCredentials, AuthResponse } from '@/types';
import toast from 'react-hot-toast';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login: storeLogin, logout: storeLogout, user } = useAuthStore();

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await api.post<{ data: AuthResponse }>('/auth/login', credentials);
      const { user, accessToken, refreshToken } = response.data.data;

      storeLogin(user, accessToken, refreshToken);
      toast.success('Welcome back!');

      // Redirect based on role
      if (user.role === 'CLIENT') {
        router.push('/portal');
      } else {
        router.push('/dashboard');
      }

      return user;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    storeLogout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setIsLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword: newPassword,
      });
      toast.success('Password changed successfully');
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    logout,
    changePassword,
    isLoading,
    user,
    isAuthenticated: !!user,
  };
}

