import { Decimal } from '@prisma/client/runtime/library';

export interface ClientResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  company: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  taxId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  hasPortalAccess: boolean;
  convertedFrom?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

export interface ClientWithSubscriptions extends ClientResponse {
  subscriptions: {
    id: string;
    quantity: number;
    customPrice: Decimal | null;
    startDate: Date;
    endDate: Date | null;
    isActive: boolean;
    product: {
      id: string;
      name: string;
      price: Decimal;
      billingCycle: string;
    };
  }[];
}

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

