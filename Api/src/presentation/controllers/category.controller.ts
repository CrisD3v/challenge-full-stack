import { NextFunction, Request, Response } from 'express';
import { CreateCategoryUseCase } from '../../application/use-cases/create-category.use-case';
import { DeleteCategoryUseCase } from '../../application/use-cases/delete-category.use-case';
import { GetCategoriesUseCase } from '../../application/use-cases/get-categories.use-case';
import { UpdateCategoryUseCase } from '../../application/use-cases/update-category.use-case';
import { ConflictError } from '../../shared/errors/conflict.error';
import { NotFoundError } from '../../shared/errors/not-found.error';
import { UnauthorizedError } from '../../shared/errors/unauthorized.error';
import { ValidationError } from '../../shared/errors/validation.error';

export class CategoryController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly getCategoriesUseCase: GetCategoriesUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase
  ) { }

  /**
   * Crear una nueva categoría
   * POST /api/categorias
   */
  createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Usuario no autenticado'
        });
        return;
      }

      const { name, color } = req.body;

      const category = await this.createCategoryUseCase.execute({
        name,
        color,
        userId: userId
      });

      res.status(201).json({
        message: 'Categoría creada exitosamente',
        category
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  };

  /**
   * Obtener todas las categorías del usuario autenticado
   * GET /api/categorias
   */
  getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Usuario no autenticado'
        });
        return;
      }

      const categories = await this.getCategoriesUseCase.execute(userId);

      res.status(200).json({
        message: 'Categorías obtenidas exitosamente',
        categories
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  };

  /**
   * Actualizar una categoría
   * PUT /api/categorias/:id
   */
  updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categoryId = req.params.id;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Usuario no autenticado'
        });
        return;
      }

      if (!categoryId) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'ID de categoría es requerido'
        });
        return;
      }

      const { name, color } = req.body;

      const category = await this.updateCategoryUseCase.execute(categoryId, userId, {
        name,
        color
      });

      res.status(200).json({
        message: 'Categoría actualizada exitosamente',
        category
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  };

  /**
   * Eliminar una categoría
   * DELETE /api/categorias/:id
   */
  deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categoryId = req.params.id;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Usuario no autenticado'
        });
        return;
      }

      if (!categoryId) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'ID de categoría es requerido'
        });
        return;
      }

      await this.deleteCategoryUseCase.execute(categoryId, userId);

      res.status(204).send();
    } catch (error) {
      this.handleError(error, res, next);
    }
  };

  /**
   * Manejar errores y retornar respuestas HTTP apropiadas
   */
  private handleError(error: unknown, res: Response, next: NextFunction): void {
    if (error instanceof ValidationError) {
      res.status(400).json({
        error: 'Validation Error',
        message: error.message,
        field: error.field
      });
      return;
    }

    if (error instanceof ConflictError) {
      res.status(409).json({
        error: 'Conflict',
        message: error.message
      });
      return;
    }

    if (error instanceof NotFoundError) {
      res.status(404).json({
        error: 'Not Found',
        message: error.message
      });
      return;
    }

    if (error instanceof UnauthorizedError) {
      res.status(403).json({
        error: 'Forbidden',
        message: error.message
      });
      return;
    }

    // Para errores inesperados, pasar al manejador global de errores
    next(error);
  }
}
