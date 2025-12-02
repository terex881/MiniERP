'use client';

import { useState, useCallback } from 'react';
import api, { getErrorMessage } from '@/lib/api';
import { Product, CreateProductInput, BillingCycle, ApiResponse } from '@/types';
import toast from 'react-hot-toast';

interface UseProductsOptions {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  billingCycle?: BillingCycle;
}

export function useProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  const fetchProducts = useCallback(async (opts?: UseProductsOptions) => {
    setIsLoading(true);
    try {
      const params = { ...options, ...opts };
      const response = await api.get<ApiResponse<Product[]>>('/products', { params });
      setProducts(response.data.data || []);
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

  const fetchActiveProducts = async () => {
    try {
      const response = await api.get<ApiResponse<Product[]>>('/products/active');
      return response.data.data || [];
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  const getProduct = async (id: string) => {
    try {
      const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  const createProduct = async (data: CreateProductInput) => {
    try {
      const response = await api.post<ApiResponse<Product>>('/products', data);
      toast.success('Product created successfully');
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  const updateProduct = async (id: string, data: Partial<CreateProductInput>) => {
    try {
      const response = await api.put<ApiResponse<Product>>(`/products/${id}`, data);
      toast.success('Product updated successfully');
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted successfully');
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  const getProductStats = async (id: string) => {
    try {
      const response = await api.get<ApiResponse<any>>(`/products/${id}/stats`);
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  return {
    products,
    meta,
    isLoading,
    fetchProducts,
    fetchActiveProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductStats,
  };
}

