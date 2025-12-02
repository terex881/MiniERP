'use client';

import { useState, useCallback } from 'react';
import api, { getErrorMessage } from '@/lib/api';
import { Client, CreateClientInput, ClientIncome, IncomeReport, ApiResponse } from '@/types';
import toast from 'react-hot-toast';

interface UseClientsOptions {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export function useClients(options: UseClientsOptions = {}) {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  const fetchClients = useCallback(async (opts?: UseClientsOptions) => {
    setIsLoading(true);
    try {
      const params = { ...options, ...opts };
      const response = await api.get<ApiResponse<Client[]>>('/clients', { params });
      setClients(response.data.data || []);
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

  const getClient = async (id: string) => {
    try {
      const response = await api.get<ApiResponse<Client>>(`/clients/${id}`);
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  const createClient = async (data: CreateClientInput) => {
    try {
      const response = await api.post<ApiResponse<Client>>('/clients', data);
      toast.success('Client created successfully');
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  const updateClient = async (id: string, data: Partial<CreateClientInput>) => {
    try {
      const response = await api.put<ApiResponse<Client>>(`/clients/${id}`, data);
      toast.success('Client updated successfully');
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      await api.delete(`/clients/${id}`);
      toast.success('Client deleted successfully');
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  const getClientIncome = async (id: string) => {
    try {
      const response = await api.get<ApiResponse<ClientIncome>>(`/clients/${id}/income`);
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  const getIncomeReport = async () => {
    try {
      const response = await api.get<ApiResponse<IncomeReport>>('/clients/income-report');
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  const addProduct = async (clientId: string, productId: string, quantity: number = 1, customPrice?: number) => {
    try {
      const response = await api.post<ApiResponse<Client>>(`/clients/${clientId}/products`, {
        productId,
        quantity,
        customPrice,
      });
      toast.success('Product added successfully');
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  const removeProduct = async (clientId: string, productId: string) => {
    try {
      const response = await api.delete<ApiResponse<Client>>(`/clients/${clientId}/products/${productId}`);
      toast.success('Product removed successfully');
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  const createPortalAccount = async (clientId: string) => {
    try {
      const response = await api.post<ApiResponse<Client>>(`/clients/${clientId}/create-portal-account`);
      toast.success('Portal account created successfully');
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  return {
    clients,
    meta,
    isLoading,
    fetchClients,
    getClient,
    createClient,
    updateClient,
    deleteClient,
    getClientIncome,
    getIncomeReport,
    addProduct,
    removeProduct,
    createPortalAccount,
  };
}

