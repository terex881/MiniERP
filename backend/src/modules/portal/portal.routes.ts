import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { clientOnly } from '../../middleware/rbac.middleware';
import { validateBody, validateQuery } from '../../middleware/validate.middleware';
import { uploadSingle } from '../../middleware/upload.middleware';
import { claimsService } from '../claims/claims.service';
import { claimQuerySchema, createPortalClaimSchema } from '../claims/claims.schema';
import { dashboardService } from '../dashboard/dashboard.service';
import { prisma } from '../../config/database';
import { sendSuccess, sendCreated, sendForbidden, sendNotFound } from '../../utils/response';
import path from 'path';
import { z } from 'zod';

const router = Router();

// All portal routes require authentication and client role
router.use(authenticate);
router.use(clientOnly);

// Profile schema
const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
});

// Dashboard
router.get('/dashboard', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clientId } = req.user!;
    if (!clientId) {
      sendForbidden(res, 'Client profile not found');
      return;
    }
    const stats = await dashboardService.getClientPortalStats(clientId);
    sendSuccess(res, stats, 'Dashboard retrieved successfully');
  } catch (error) {
    next(error);
  }
});

// Profile
router.get('/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clientId } = req.user!;
    if (!clientId) {
      sendForbidden(res, 'Client profile not found');
      return;
    }

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        company: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        createdAt: true,
      },
    });

    if (!client) {
      sendNotFound(res, 'Client profile not found');
      return;
    }

    sendSuccess(res, client, 'Profile retrieved successfully');
  } catch (error) {
    next(error);
  }
});

router.put('/profile', validateBody(updateProfileSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clientId } = req.user!;
    if (!clientId) {
      sendForbidden(res, 'Client profile not found');
      return;
    }

    const client = await prisma.client.update({
      where: { id: clientId },
      data: req.body,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        company: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        createdAt: true,
      },
    });

    sendSuccess(res, client, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
});

// Subscriptions
router.get('/subscriptions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clientId } = req.user!;
    if (!clientId) {
      sendForbidden(res, 'Client profile not found');
      return;
    }

    const subscriptions = await prisma.clientProduct.findMany({
      where: { clientId, isActive: true },
      select: {
        id: true,
        quantity: true,
        customPrice: true,
        startDate: true,
        endDate: true,
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            billingCycle: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    sendSuccess(res, subscriptions, 'Subscriptions retrieved successfully');
  } catch (error) {
    next(error);
  }
});

// Claims
router.get('/claims', validateQuery(claimQuerySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, role, clientId } = req.user!;
    if (!clientId) {
      sendForbidden(res, 'Client profile not found');
      return;
    }

    const query = req.query as any;
    const result = await claimsService.findAll(query, userId, role, clientId);

    sendSuccess(res, result.data, 'Claims retrieved successfully', 200, result.meta);
  } catch (error) {
    next(error);
  }
});

router.get('/claims/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { userId, role, clientId } = req.user!;
    if (!clientId) {
      sendForbidden(res, 'Client profile not found');
      return;
    }

    const claim = await claimsService.findById(id, userId, role, clientId);
    sendSuccess(res, claim, 'Claim retrieved successfully');
  } catch (error) {
    next(error);
  }
});

router.post('/claims', validateBody(createPortalClaimSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, clientId } = req.user!;
    if (!clientId) {
      sendForbidden(res, 'Client profile not found');
      return;
    }

    const claim = await claimsService.createPortalClaim(req.body, userId, clientId);
    sendCreated(res, claim, 'Claim created successfully');
  } catch (error) {
    next(error);
  }
});

// Claim attachments
router.post('/claims/:id/attachments', uploadSingle, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { userId, role, clientId } = req.user!;

    if (!clientId) {
      sendForbidden(res, 'Client profile not found');
      return;
    }

    if (!req.file) {
      sendNotFound(res, 'No file uploaded');
      return;
    }

    const claim = await claimsService.addAttachment(id, req.file, userId, role, clientId);
    sendSuccess(res, claim, 'Attachment uploaded successfully');
  } catch (error) {
    next(error);
  }
});

router.get('/claims/:id/attachments/:attachmentId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, attachmentId } = req.params;
    const { userId, role, clientId } = req.user!;

    if (!clientId) {
      sendForbidden(res, 'Client profile not found');
      return;
    }

    const attachment = await claimsService.getAttachment(id, attachmentId, userId, role, clientId);

    res.setHeader('Content-Type', attachment.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.originalName}"`);
    res.sendFile(path.resolve(attachment.path));
  } catch (error) {
    next(error);
  }
});

export default router;

