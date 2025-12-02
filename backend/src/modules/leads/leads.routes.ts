import { Router } from 'express';
import { leadsController } from './leads.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { staffOnly, requireRoles } from '../../middleware/rbac.middleware';
import { validateBody, validateQuery } from '../../middleware/validate.middleware';
import {
  createLeadSchema,
  updateLeadSchema,
  updateLeadStatusSchema,
  assignLeadSchema,
  convertLeadSchema,
  leadQuerySchema,
} from './leads.schema';

const router = Router();

// All routes require authentication and staff access
router.use(authenticate);
router.use(staffOnly);

// List and stats routes
router.get('/', validateQuery(leadQuerySchema), leadsController.findAll);
router.get('/stats', leadsController.getStats);
router.get('/sources', leadsController.getSources);

// CRUD routes
router.get('/:id', leadsController.findById);
router.post('/', validateBody(createLeadSchema), leadsController.create);
router.put('/:id', validateBody(updateLeadSchema), leadsController.update);
router.delete('/:id', requireRoles('ADMIN', 'SUPERVISOR'), leadsController.delete);

// Status and assignment routes
router.put('/:id/status', validateBody(updateLeadStatusSchema), leadsController.updateStatus);
router.put('/:id/assign', requireRoles('ADMIN', 'SUPERVISOR'), validateBody(assignLeadSchema), leadsController.assign);
router.post('/:id/convert', requireRoles('ADMIN', 'SUPERVISOR'), validateBody(convertLeadSchema), leadsController.convert);

export default router;

