import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { adminOnly, staffOnly } from '../../middleware/rbac.middleware';
import { validateBody, validateQuery } from '../../middleware/validate.middleware';
import { createUserSchema, updateUserSchema, resetPasswordSchema, userQuerySchema } from './users.schema';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Staff can get assignable users list
router.get('/assignable', staffOnly, usersController.getAssignable);

// Admin only routes
router.get('/', adminOnly, validateQuery(userQuerySchema), usersController.findAll);
router.get('/:id', adminOnly, usersController.findById);
router.post('/', adminOnly, validateBody(createUserSchema), usersController.create);
router.put('/:id', adminOnly, validateBody(updateUserSchema), usersController.update);
router.delete('/:id', adminOnly, usersController.delete);
router.put('/:id/toggle-status', adminOnly, usersController.toggleStatus);
router.put('/:id/reset-password', adminOnly, validateBody(resetPasswordSchema), usersController.resetPassword);

export default router;

