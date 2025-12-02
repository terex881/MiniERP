import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { adminOnly, requireRoles, staffOnly, clientOnly } from '../../middleware/rbac.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Role-specific dashboards
router.get('/admin', adminOnly, dashboardController.getAdminStats);
router.get('/supervisor', requireRoles('ADMIN', 'SUPERVISOR'), dashboardController.getSupervisorStats);
router.get('/operator', staffOnly, dashboardController.getOperatorStats);
router.get('/client', clientOnly, dashboardController.getClientStats);

// Generic dashboard (returns data based on user role)
router.get('/', dashboardController.getDashboard);

export default router;

