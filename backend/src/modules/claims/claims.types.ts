import { ClaimStatus, ClaimPriority } from '@prisma/client';

export interface ClaimResponse {
  id: string;
  title: string;
  description: string;
  status: ClaimStatus;
  priority: ClaimPriority;
  resolution: string | null;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    company: string | null;
  };
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
  attachments: {
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    createdAt: Date;
  }[];
}

export interface ClaimStats {
  total: number;
  byStatus: {
    status: ClaimStatus;
    count: number;
  }[];
  byPriority: {
    priority: ClaimPriority;
    count: number;
  }[];
  averageResolutionTime: number; // in hours
  resolvedThisMonth: number;
  openClaims: number;
}

