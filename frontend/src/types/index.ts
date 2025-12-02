// Enums
export type Role = 'ADMIN' | 'SUPERVISOR' | 'OPERATOR' | 'CLIENT';
export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';
export type ClaimStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type ClaimPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type BillingCycle = 'monthly' | 'yearly' | 'one-time';

// User
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  clientId?: string;
}

// Auth
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  clientId?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

// Lead
export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  source?: string;
  status: LeadStatus;
  notes?: string;
  estimatedValue?: number;
  createdAt: string;
  updatedAt: string;
  convertedAt?: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// Client
export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  taxId?: string;
  isActive: boolean;
  hasPortalAccess: boolean;
  createdAt: string;
  updatedAt: string;
  subscriptions?: ClientProduct[];
}

// Product
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  billingCycle: BillingCycle;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    clientProducts: number;
  };
}

// Client Product (Subscription)
export interface ClientProduct {
  id: string;
  quantity: number;
  customPrice?: number;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  product: {
    id: string;
    name: string;
    price: number;
    billingCycle: BillingCycle;
  };
}

// Claim
export interface Claim {
  id: string;
  title: string;
  description: string;
  status: ClaimStatus;
  priority: ClaimPriority;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
  };
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  attachments: ClaimAttachment[];
}

export interface ClaimAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

// API Response
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Dashboard
export interface DashboardStats {
  users?: {
    total: number;
    active: number;
    byRole: { role: string; count: number }[];
  };
  leads: {
    total: number;
    new: number;
    converted: number;
    conversionRate: number;
  };
  clients: {
    total: number;
    active: number;
    withSubscriptions: number;
  };
  claims: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
  };
  revenue?: {
    monthlyRecurring: number;
    yearlyProjected: number;
  };
  recentActivity: {
    id: string;
    action: string;
    description: string;
    createdAt: string;
    user: { firstName: string; lastName: string };
  }[];
}

export interface ClientPortalStats {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
  };
  subscriptions: {
    active: number;
    total: number;
    monthlySpend: number;
  };
  claims: {
    total: number;
    open: number;
    resolved: number;
  };
  recentClaims: {
    id: string;
    title: string;
    status: string;
    createdAt: string;
  }[];
}

// Income
export interface ClientIncome {
  clientId: string;
  clientName: string;
  monthlyIncome: number;
  yearlyIncome: number;
  products: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    billingCycle: string;
    totalMonthly: number;
  }[];
}

export interface IncomeReport {
  totalMonthlyIncome: number;
  totalYearlyIncome: number;
  clientCount: number;
  activeSubscriptions: number;
  topClients: {
    clientId: string;
    clientName: string;
    totalMonthly: number;
  }[];
  productBreakdown: {
    productId: string;
    productName: string;
    clientCount: number;
    totalMonthlyRevenue: number;
  }[];
}

// Form inputs
export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: Role;
}

export interface CreateLeadInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  source?: string;
  notes?: string;
  estimatedValue?: number;
  assignedToId?: string;
}

export interface CreateClientInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  taxId?: string;
}

export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  billingCycle: BillingCycle;
}

export interface CreateClaimInput {
  title: string;
  description: string;
  priority: ClaimPriority;
  clientId: string;
  assignedToId?: string;
}

// Assignable user (for dropdowns)
export interface AssignableUser {
  id: string;
  firstName: string;
  lastName: string;
  role: Role;
}

