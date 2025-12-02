import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { claimsService } from './claims.service';
import {
  CreateClaimInput,
  UpdateClaimInput,
  UpdateClaimStatusInput,
  AssignClaimInput,
  ClaimQueryInput,
  CreatePortalClaimInput,
} from './claims.schema';
import { sendSuccess, sendCreated, sendNotFound } from '../../utils/response';

class ClaimsController {
  /**
   * GET /api/claims
   * List all claims with pagination and filters
   */
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as ClaimQueryInput;
      const { userId, role, clientId } = req.user!;
      const result = await claimsService.findAll(query, userId, role, clientId);

      sendSuccess(res, result.data, 'Claims retrieved successfully', 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/claims/stats
   * Get claim statistics
   */
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, role } = req.user!;
      const stats = await claimsService.getStats(userId, role);

      sendSuccess(res, stats, 'Claim statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/claims/:id
   * Get claim by ID
   */
  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { userId, role, clientId } = req.user!;
      const claim = await claimsService.findById(id, userId, role, clientId);

      sendSuccess(res, claim, 'Claim retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/claims
   * Create new claim (staff)
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: CreateClaimInput = req.body;
      const { userId } = req.user!;
      const claim = await claimsService.create(input, userId);

      sendCreated(res, claim, 'Claim created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/portal/claims
   * Create new claim (client portal)
   */
  async createPortalClaim(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: CreatePortalClaimInput = req.body;
      const { userId, clientId } = req.user!;
      
      if (!clientId) {
        sendNotFound(res, 'Client profile not found');
        return;
      }

      const claim = await claimsService.createPortalClaim(input, userId, clientId);

      sendCreated(res, claim, 'Claim created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/claims/:id
   * Update claim
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const input: UpdateClaimInput = req.body;
      const { userId, role } = req.user!;
      const claim = await claimsService.update(id, input, userId, role);

      sendSuccess(res, claim, 'Claim updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/claims/:id
   * Delete claim
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { userId } = req.user!;
      await claimsService.delete(id, userId);

      sendSuccess(res, null, 'Claim deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/claims/:id/status
   * Update claim status
   */
  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const input: UpdateClaimStatusInput = req.body;
      const { userId, role } = req.user!;
      const claim = await claimsService.updateStatus(id, input, userId, role);

      sendSuccess(res, claim, 'Claim status updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/claims/:id/assign
   * Assign claim to user
   */
  async assign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const input: AssignClaimInput = req.body;
      const { userId, role } = req.user!;
      const claim = await claimsService.assign(id, input, userId, role);

      sendSuccess(res, claim, 'Claim assigned successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/claims/:id/attachments
   * Upload attachment to claim
   */
  async addAttachment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { userId, role, clientId } = req.user!;

      if (!req.file) {
        sendNotFound(res, 'No file uploaded');
        return;
      }

      const claim = await claimsService.addAttachment(id, req.file, userId, role, clientId);

      sendSuccess(res, claim, 'Attachment uploaded successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/claims/:id/attachments/:attachmentId
   * Download attachment
   */
  async downloadAttachment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, attachmentId } = req.params;
      const { userId, role, clientId } = req.user!;

      const attachment = await claimsService.getAttachment(id, attachmentId, userId, role, clientId);

      res.setHeader('Content-Type', attachment.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${attachment.originalName}"`);
      res.sendFile(path.resolve(attachment.path));
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/claims/:id/attachments/:attachmentId
   * Delete attachment
   */
  async deleteAttachment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, attachmentId } = req.params;
      const { userId, role } = req.user!;
      const claim = await claimsService.deleteAttachment(id, attachmentId, userId, role);

      sendSuccess(res, claim, 'Attachment deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const claimsController = new ClaimsController();

