import { Router } from 'express';
import { productsController } from './products.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { staffOnly, adminOnly } from '../../middleware/rbac.middleware';
import { validateBody, validateQuery } from '../../middleware/validate.middleware';
import { createProductSchema, updateProductSchema, productQuerySchema } from './products.schema';

const router = Router();

// All routes require authentication and staff access
router.use(authenticate);
router.use(staffOnly);

// List routes (available to all staff)
router.get('/', validateQuery(productQuerySchema), productsController.findAll);
router.get('/active', productsController.findAllActive);
router.get('/:id', productsController.findById);
router.get('/:id/stats', productsController.getStats);

// Admin only routes
router.post('/', adminOnly, validateBody(createProductSchema), productsController.create);
router.put('/:id', adminOnly, validateBody(updateProductSchema), productsController.update);
router.delete('/:id', adminOnly, productsController.delete);

export default router;

