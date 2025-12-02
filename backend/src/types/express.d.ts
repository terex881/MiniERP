import { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: Role;
        firstName: string;
        lastName: string;
        clientId?: string; // For CLIENT role users
      };
    }
  }
}

export {};

