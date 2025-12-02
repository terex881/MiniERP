import { Request, Response, NextFunction } from 'express';
import { clientsService } from './clients.service';
import {
  CreateClientInput,
  UpdateClientInput,
  AddProductInput,
  UpdateProductInput,
  ClientQueryInput,
} from './clients.schema';
import { sendSuccess, sendCreated } from '../../utils/response';

class ClientsController {
  /**
   * GET /api/clients
   * List all clients with pagination and filters
   */
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as ClientQueryInput;
      const result = await clientsService.findAll(query);

      sendSuccess(res, result.data, 'Clients retrieved successfully', 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/clients/income-report
   * Get total income report
   */
  async getIncomeReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const report = await clientsService.getIncomeReport();

      sendSuccess(res, report, 'Income report retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/clients/:id
   * Get client by ID with subscriptions
   */
  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const client = await clientsService.findById(id);

      sendSuccess(res, client, 'Client retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/clients/:id/income
   * Get client income calculation
   */
  async getClientIncome(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const income = await clientsService.getClientIncome(id);

      sendSuccess(res, income, 'Client income retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/clients
   * Create new client
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: CreateClientInput = req.body;
      const { userId } = req.user!;
      const client = await clientsService.create(input, userId);

      sendCreated(res, client, 'Client created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/clients/:id
   * Update client
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const input: UpdateClientInput = req.body;
      const { userId } = req.user!;
      const client = await clientsService.update(id, input, userId);

      sendSuccess(res, client, 'Client updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/clients/:id
   * Delete client (soft delete)
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { userId } = req.user!;
      await clientsService.delete(id, userId);

      sendSuccess(res, null, 'Client deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/clients/:id/products
   * Add product to client
   */
  async addProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const input: AddProductInput = req.body;
      const { userId } = req.user!;
      const client = await clientsService.addProduct(id, input, userId);

      sendSuccess(res, client, 'Product added to client successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/clients/:id/products/:productId
   * Update client product subscription
   */
  async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, productId } = req.params;
      const input: UpdateProductInput = req.body;
      const { userId } = req.user!;
      const client = await clientsService.updateProduct(id, productId, input, userId);

      sendSuccess(res, client, 'Product subscription updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/clients/:id/products/:productId
   * Remove product from client
   */
  async removeProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, productId } = req.params;
      const { userId } = req.user!;
      const client = await clientsService.removeProduct(id, productId, userId);

      sendSuccess(res, client, 'Product removed from client successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/clients/:id/create-portal-account
   * Create portal access for client
   */
  async createPortalAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { userId } = req.user!;
      const client = await clientsService.createPortalAccount(id, userId);

      sendSuccess(res, client, 'Portal account created successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const clientsController = new ClientsController();

