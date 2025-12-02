'use client';

import { useState, useCallback } from 'react';
import api, { getErrorMessage } from '@/lib/api';
import { Claim, CreateClaimInput, ClaimStatus, ClaimPriority, ApiResponse } from '@/types';
import toast from 'react-hot-toast';

interface UseClaimsOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: ClaimStatus;
  priority?: ClaimPriority;
  clientId?: string;
  assignedToId?: string;
}

export function useClaims(options: UseClaimsOptions = {}) {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  const fetchClaims = useCallback(async (opts?: UseClaimsOptions) => {
    setIsLoading(true);
    try {
      const params = { ...options, ...opts };
      const response = await api.get<ApiResponse<Claim[]>>('/claims', { params });
      setClaims(response.data.data || []);
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

  const getClaim = async (id: string) => {
    try {
      const response = await api.get<ApiResponse<Claim>>(`/claims/${id}`);
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  const createClaim = async (data: CreateClaimInput) => {
    try {
      const response = await api.post<ApiResponse<Claim>>('/claims', data);
      toast.success('Claim created successfully');
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  const updateClaim = async (id: string, data: Partial<CreateClaimInput>) => {
    try {
      const response = await api.put<ApiResponse<Claim>>(`/claims/${id}`, data);
      toast.success('Claim updated successfully');
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  const deleteClaim = async (id: string) => {
    try {
      await api.delete(`/claims/${id}`);
      toast.success('Claim deleted successfully');
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  const updateStatus = async (id: string, status: ClaimStatus, resolution?: string) => {
    try {
      const response = await api.put<ApiResponse<Claim>>(`/claims/${id}/status`, { status, resolution });
      toast.success('Status updated successfully');
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  const assignClaim = async (id: string, assignedToId: string | null) => {
    try {
      const response = await api.put<ApiResponse<Claim>>(`/claims/${id}/assign`, { assignedToId });
      toast.success('Claim assigned successfully');
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  const uploadAttachment = async (claimId: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post<ApiResponse<Claim>>(`/claims/${claimId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('File uploaded successfully');
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  const deleteAttachment = async (claimId: string, attachmentId: string) => {
    try {
      const response = await api.delete<ApiResponse<Claim>>(`/claims/${claimId}/attachments/${attachmentId}`);
      toast.success('Attachment deleted successfully');
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  const downloadAttachment = (claimId: string, attachmentId: string) => {
    const token = localStorage.getItem('auth-storage');
    const authData = token ? JSON.parse(token) : null;
    const accessToken = authData?.state?.accessToken;
    
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/claims/${claimId}/attachments/${attachmentId}`;
    
    // Open in new tab with auth header (workaround)
    window.open(url, '_blank');
  };

  const getStats = async () => {
    try {
      const response = await api.get<ApiResponse<any>>('/claims/stats');
      return response.data.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  };

  return {
    claims,
    meta,
    isLoading,
    fetchClaims,
    getClaim,
    createClaim,
    updateClaim,
    deleteClaim,
    updateStatus,
    assignClaim,
    uploadAttachment,
    deleteAttachment,
    downloadAttachment,
    getStats,
  };
}

