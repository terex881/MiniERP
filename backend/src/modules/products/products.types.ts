import { Decimal } from '@prisma/client/runtime/library';

export interface ProductResponse {
  id: string;
  name: string;
  description: string | null;
  price: Decimal;
  billingCycle: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductWithStats extends ProductResponse {
  _count: {
    clientProducts: number;
  };
}

