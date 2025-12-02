import { LeadStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface LeadResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  company: string | null;
  source: string | null;
  status: LeadStatus;
  notes: string | null;
  estimatedValue: Decimal | null;
  createdAt: Date;
  updatedAt: Date;
  convertedAt: Date | null;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  assignedTo: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

export interface LeadStats {
  total: number;
  byStatus: {
    status: LeadStatus;
    count: number;
  }[];
  totalEstimatedValue: number;
  conversionRate: number;
}

