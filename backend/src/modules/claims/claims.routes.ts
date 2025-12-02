import { Router } from 'express';
import { claimsController } from './claims.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { staffOnly, requireRoles, adminOnly } from '../../middleware/rbac.middleware';
import { validateBody, validateQuery } from '../../middleware/validate.middleware';
import { uploadSingle } from '../../middleware/upload.middleware';
import {
  createClaimSchema,
  updateClaimSchema,
  updateClaimStatusSchema,
  assignClaimSchema,
  claimQuerySchema,
} from './claims.schema';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Staff routes
router.get('/', staffOnly, validateQuery(claimQuerySchema), claimsController.findAll);
router.get('/stats', staffOnly, claimsController.getStats);
router.get('/:id', staffOnly, claimsController.findById);
router.post('/', staffOnly, validateBody(createClaimSchema), claimsController.create);
router.put('/:id', staffOnly, validateBody(updateClaimSchema), claimsController.update);
router.delete('/:id', adminOnly, claimsController.delete);

// Status and assignment
router.put('/:id/status', staffOnly, validateBody(updateClaimStatusSchema), claimsController.updateStatus);
router.put('/:id/assign', requireRoles('ADMIN', 'SUPERVISOR'), validateBody(assignClaimSchema), claimsController.assign);

// Attachments
router.post('/:id/attachments', staffOnly, uploadSingle, claimsController.addAttachment);
router.get('/:id/attachments/:attachmentId', staffOnly, claimsController.downloadAttachment);
router.delete('/:id/attachments/:attachmentId', requireRoles('ADMIN', 'SUPERVISOR'), claimsController.deleteAttachment);

export default router;

