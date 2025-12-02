'use client';

import { useState, useCallback } from 'react';
import api, { getErrorMessage } from '@/lib/api';
import { Lead, CreateLeadInput, LeadStatus, ApiResponse } from '@/types';
import toast from 'react-hot-toast';

interface UseLeadsOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: LeadStatus;
  assignedToId?: string;
  source?: string;
}

export function useLeads(options: UseLeadsOptions = {}) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  const fetchLeads = useCallback(async (opts?: UseLeadsOptions) => {
    setIsLoading(true);
    try {
      const params = { ...options, ...opts };
      const response = await api.get<ApiResponse<Lead[]>>('/leads', { params });
      setLeads(response.data.data || []);
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

  const getLead = async (id: string) => {
    try {
      const response = await api.get<ApiResponse<Lead>>(`/leads/${id}`);
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  const createLead = async (data: CreateLeadInput) => {
    try {
      const response = await api.post<ApiResponse<Lead>>('/leads', data);
      toast.success('Lead created successfully');
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  const updateLead = async (id: string, data: Partial<CreateLeadInput>) => {
    try {
      const response = await api.put<ApiResponse<Lead>>(`/leads/${id}`, data);
      toast.success('Lead updated successfully');
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  const deleteLead = async (id: string) => {
    try {
      await api.delete(`/leads/${id}`);
      toast.success('Lead deleted successfully');
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  const updateStatus = async (id: string, status: LeadStatus) => {
    try {
      const response = await api.put<ApiResponse<Lead>>(`/leads/${id}/status`, { status });
      toast.success('Status updated successfully');
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  const assignLead = async (id: string, assignedToId: string | null) => {
    try {
      const response = await api.put<ApiResponse<Lead>>(`/leads/${id}/assign`, { assignedToId });
      toast.success('Lead assigned successfully');
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  const convertLead = async (id: string, options: { createPortalAccount?: boolean } = {}) => {
    try {
      const response = await api.post<ApiResponse<{ lead: Lead; clientId: string }>>(`/leads/${id}/convert`, options);
      toast.success('Lead converted to client successfully');
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  const getStats = async () => {
    try {
      const response = await api.get<ApiResponse<any>>('/leads/stats');
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  const getSources = async () => {
    try {
      const response = await api.get<ApiResponse<string[]>>('/leads/sources');
      return response.data.data || [];
    } catch (error) {
      return [];
    }
  };

  return {
    leads,
    meta,
    isLoading,
    fetchLeads,
    getLead,
    createLead,
    updateLead,
    deleteLead,
    updateStatus,
    assignLead,
    convertLead,
    getStats,
    getSources,
  };
}

