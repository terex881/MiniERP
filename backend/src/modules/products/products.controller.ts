import { Request, Response, NextFunction } from 'express';
import { productsService } from './products.service';
import { CreateProductInput, UpdateProductInput, ProductQueryInput } from './products.schema';
import { sendSuccess, sendCreated } from '../../utils/response';

class ProductsController {
  /**
   * GET /api/products
   * List all products with pagination and filters
   */
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as ProductQueryInput;
      const result = await productsService.findAll(query);

      sendSuccess(res, result.data, 'Products retrieved successfully', 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/products/active
   * Get all active products (for dropdowns)
   */
  async findAllActive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await productsService.findAllActive();

      sendSuccess(res, products, 'Active products retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/products/:id
   * Get product by ID
   */
  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const product = await productsService.findById(id);

      sendSuccess(res, product, 'Product retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/products/:id/stats
   * Get product usage stats
   */
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const stats = await productsService.getUsageStats(id);

      sendSuccess(res, stats, 'Product stats retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/products
   * Create new product
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: CreateProductInput = req.body;
      const product = await productsService.create(input);

      sendCreated(res, product, 'Product created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/products/:id
   * Update product
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const input: UpdateProductInput = req.body;
      const product = await productsService.update(id, input);

      sendSuccess(res, product, 'Product updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/products/:id
   * Delete product (soft delete)
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await productsService.delete(id);

      sendSuccess(res, null, 'Product deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const productsController = new ProductsController();

