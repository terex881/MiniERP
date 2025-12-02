import express, { Express } from 'express';
import cors from 'cors';
import { corsOptions } from './config/cors';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import leadsRoutes from './modules/leads/leads.routes';
import clientsRoutes from './modules/clients/clients.routes';
import productsRoutes from './modules/products/products.routes';
import claimsRoutes from './modules/claims/claims.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import portalRoutes from './modules/portal/portal.routes';

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/leads', leadsRoutes);
  app.use('/api/clients', clientsRoutes);
  app.use('/api/products', productsRoutes);
  app.use('/api/claims', claimsRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/portal', portalRoutes);

  // 404 handler
  app.use(notFoundHandler);

  // Error handler
  app.use(errorHandler);

  return app;
}

