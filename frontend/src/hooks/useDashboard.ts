'use client';

import { useState } from 'react';
import api, { getErrorMessage } from '@/lib/api';
import { DashboardStats, ClientPortalStats, ApiResponse } from '@/types';
import toast from 'react-hot-toast';

export function useDashboard() {
  const [isLoading, setIsLoading] = useState(false);

  const getAdminDashboard = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<ApiResponse<DashboardStats>>('/dashboard/admin');
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getSupervisorDashboard = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<ApiResponse<DashboardStats>>('/dashboard/supervisor');
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getOperatorDashboard = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<ApiResponse<DashboardStats>>('/dashboard/operator');
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getClientDashboard = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<ApiResponse<ClientPortalStats>>('/dashboard/client');
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getDashboard = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<ApiResponse<DashboardStats | ClientPortalStats>>('/dashboard');
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    getAdminDashboard,
    getSupervisorDashboard,
    getOperatorDashboard,
    getClientDashboard,
    getDashboard,
  };
}

