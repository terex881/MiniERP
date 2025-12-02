import { Request, Response, NextFunction } from 'express';
import { leadsService } from './leads.service';
import {
  CreateLeadInput,
  UpdateLeadInput,
  UpdateLeadStatusInput,
  AssignLeadInput,
  ConvertLeadInput,
  LeadQueryInput,
} from './leads.schema';
import { sendSuccess, sendCreated } from '../../utils/response';

class LeadsController {
  /**
   * GET /api/leads
   * List all leads with pagination and filters
   */
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as LeadQueryInput;
      const { userId, role } = req.user!;
      const result = await leadsService.findAll(query, userId, role);

      sendSuccess(res, result.data, 'Leads retrieved successfully', 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/leads/stats
   * Get lead statistics
   */
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, role } = req.user!;
      const stats = await leadsService.getStats(userId, role);

      sendSuccess(res, stats, 'Lead statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/leads/sources
   * Get available lead sources
   */
  async getSources(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sources = await leadsService.getSources();

      sendSuccess(res, sources, 'Lead sources retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/leads/:id
   * Get lead by ID
   */
  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { userId, role } = req.user!;
      const lead = await leadsService.findById(id, userId, role);

      sendSuccess(res, lead, 'Lead retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/leads
   * Create new lead
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: CreateLeadInput = req.body;
      const { userId } = req.user!;
      const lead = await leadsService.create(input, userId);

      sendCreated(res, lead, 'Lead created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/leads/:id
   * Update lead
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const input: UpdateLeadInput = req.body;
      const { userId, role } = req.user!;
      const lead = await leadsService.update(id, input, userId, role);

      sendSuccess(res, lead, 'Lead updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/leads/:id
   * Delete lead
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { userId, role } = req.user!;
      await leadsService.delete(id, userId, role);

      sendSuccess(res, null, 'Lead deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/leads/:id/status
   * Update lead status
   */
  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const input: UpdateLeadStatusInput = req.body;
      const { userId, role } = req.user!;
      const lead = await leadsService.updateStatus(id, input, userId, role);

      sendSuccess(res, lead, 'Lead status updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/leads/:id/assign
   * Assign lead to user
   */
  async assign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const input: AssignLeadInput = req.body;
      const { userId, role } = req.user!;
      const lead = await leadsService.assign(id, input, userId, role);

      sendSuccess(res, lead, 'Lead assigned successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/leads/:id/convert
   * Convert lead to client
   */
  async convert(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const input: ConvertLeadInput = req.body;
      const { userId, role } = req.user!;
      const result = await leadsService.convert(id, input, userId, role);

      sendSuccess(res, result, 'Lead converted to client successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const leadsController = new LeadsController();

