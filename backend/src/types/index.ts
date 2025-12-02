import { Role, LeadStatus, ClaimStatus, ClaimPriority } from '@prisma/client';

// Re-export Prisma enums for convenience
export { Role, LeadStatus, ClaimStatus, ClaimPriority };

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  clientId?: string;
}

// Filters
export interface LeadFilters {
  status?: LeadStatus;
  assignedToId?: string;
  source?: string;
  search?: string;
}

export interface ClientFilters {
  isActive?: boolean;
  search?: string;
}

export interface ClaimFilters {
  status?: ClaimStatus;
  priority?: ClaimPriority;
  clientId?: string;
  assignedToId?: string;
  search?: string;
}

// Income calculation
export interface ClientIncome {
  clientId: string;
  monthlyIncome: number;
  yearlyIncome: number;
  products: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    billingCycle: string;
  }[];
}

export interface TotalIncomeReport {
  totalMonthlyIncome: number;
  totalYearlyIncome: number;
  clientCount: number;
  productBreakdown: {
    productId: string;
    productName: string;
    totalRevenue: number;
    clientCount: number;
  }[];
}

