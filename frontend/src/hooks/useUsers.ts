'use client';

import { useState, useCallback } from 'react';
import api, { getErrorMessage } from '@/lib/api';
import { User, CreateUserInput, AssignableUser, ApiResponse } from '@/types';
import toast from 'react-hot-toast';

interface UseUsersOptions {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}

export function useUsers(options: UseUsersOptions = {}) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  const fetchUsers = useCallback(async (opts?: UseUsersOptions) => {
    setIsLoading(true);
    try {
      const params = { ...options, ...opts };
      const response = await api.get<ApiResponse<User[]>>('/users', { params });
      setUsers(response.data.data || []);
      if (response.data.meta) {
        setMeta(response.data.meta);
      }
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const getUser = async (id: string) => {
    try {
      const response = await api.get<ApiResponse<User>>(`/users/${id}`);
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  const createUser = async (data: CreateUserInput) => {
    try {
      const response = await api.post<ApiResponse<User>>('/users', data);
      toast.success('User created successfully');
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  const updateUser = async (id: string, data: Partial<CreateUserInput>) => {
    try {
      const response = await api.put<ApiResponse<User>>(`/users/${id}`, data);
      toast.success('User updated successfully');
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted successfully');
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      const response = await api.put<ApiResponse<User>>(`/users/${id}/toggle-status`);
      toast.success(response.data.message);
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  const resetPassword = async (id: string, newPassword: string) => {
    try {
      await api.put(`/users/${id}/reset-password`, { newPassword });
      toast.success('Password reset successfully');
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  const getAssignableUsers = async () => {
    try {
      const response = await api.get<ApiResponse<AssignableUser[]>>('/users/assignable');
      return response.data.data || [];
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  return {
    users,
    meta,
    isLoading,
    fetchUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    toggleStatus,
    resetPassword,
    getAssignableUsers,
  };
}

