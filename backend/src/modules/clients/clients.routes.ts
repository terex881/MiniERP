import { Router } from 'express';
import { clientsController } from './clients.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { staffOnly, requireRoles, adminOnly } from '../../middleware/rbac.middleware';
import { validateBody, validateQuery } from '../../middleware/validate.middleware';
import {
  createClientSchema,
  updateClientSchema,
  addProductSchema,
  updateProductSchema,
  clientQuerySchema,
} from './clients.schema';

const router = Router();

// All routes require authentication and staff access
router.use(authenticate);
router.use(staffOnly);

// List and report routes
router.get('/', validateQuery(clientQuerySchema), clientsController.findAll);
router.get('/income-report', requireRoles('ADMIN', 'SUPERVISOR'), clientsController.getIncomeReport);

// CRUD routes
router.get('/:id', clientsController.findById);
router.get('/:id/income', requireRoles('ADMIN', 'SUPERVISOR'), clientsController.getClientIncome);
router.post('/', requireRoles('ADMIN', 'SUPERVISOR'), validateBody(createClientSchema), clientsController.create);
router.put('/:id', requireRoles('ADMIN', 'SUPERVISOR'), validateBody(updateClientSchema), clientsController.update);
router.delete('/:id', adminOnly, clientsController.delete);

// Product subscription routes
router.post('/:id/products', requireRoles('ADMIN', 'SUPERVISOR'), validateBody(addProductSchema), clientsController.addProduct);
router.put('/:id/products/:productId', requireRoles('ADMIN', 'SUPERVISOR'), validateBody(updateProductSchema), clientsController.updateProduct);
router.delete('/:id/products/:productId', requireRoles('ADMIN', 'SUPERVISOR'), clientsController.removeProduct);

// Portal account
router.post('/:id/create-portal-account', adminOnly, clientsController.createPortalAccount);

export default router;

