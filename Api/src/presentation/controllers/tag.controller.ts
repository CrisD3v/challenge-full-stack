import { NextFunction, Request, Response } from 'express';
import { CreateTagUseCase } from '../../application/use-cases/create-tag.use-case';
import { GetTagsUseCase } from '../../application/use-cases/get-tags.use-case';
import { ConflictError } from '../../shared/errors/conflict.error';
import { ValidationError } from '../../shared/errors/validation.error';

export class TagController {
  constructor(
    private readonly createTagUseCase: CreateTagUseCase,
    private readonly getTagsUseCase: GetTagsUseCase
  ) { }

  /**
   * Crear una nueva etiqueta
   * POST /api/etiquetas
   */
  createTag = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Usuario no autenticado'
        });
        return;
      }

      const { name } = req.body;

      const tag = await this.createTagUseCase.execute({
        name,
        userId: userId
      });

      res.status(201).json({
        message: 'Etiqueta creada exitosamente',
        tag
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  };

  /**
   * Obtener todas las etiquetas del usuario autenticado
   * GET /api/etiquetas
   */
  getTags = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Usuario no autenticado'
        });
        return;
      }

      const tags = await this.getTagsUseCase.execute(userId);

      res.status(200).json({
        message: 'Etiquetas obtenidas exitosamente',
        tags
      });
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

    // Para errores inesperados, pasar al manejador global de errores
    next(error);
  }
}
