import { Role } from '@prisma/client';

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithStats extends UserResponse {
  _count?: {
    createdLeads: number;
    assignedLeads: number;
    assignedClaims: number;
  };
}

