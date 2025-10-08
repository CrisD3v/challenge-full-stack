import { NextFunction, Request, Response } from 'express';
import { TaskFiltersDto } from '../../application/dto/task.dto';
import { CreateTaskUseCase } from '../../application/use-cases/create-task.use-case';
import { DeleteTaskUseCase } from '../../application/use-cases/delete-task.use-case';
import { GetTasksUseCase } from '../../application/use-cases/get-tasks.use-case';
import { ToggleTaskCompleteUseCase } from '../../application/use-cases/toggle-task-complete.use-case';
import { UpdateTaskUseCase } from '../../application/use-cases/update-task.use-case';
import { ConflictError } from '../../shared/errors/conflict.error';
import { ForbiddenError } from '../../shared/errors/forbidden.error';
import { NotFoundError } from '../../shared/errors/not-found.error';
import { ValidationError } from '../../shared/errors/validation.error';

export class TaskController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly getTasksUseCase: GetTasksUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase,
    private readonly toggleTaskCompleteUseCase: ToggleTaskCompleteUseCase
  ) { }

  /**
   * Crear una nueva task
   * POST /api/tareas
   */
  createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Usuario no autenticado'
        });
        return;
      }

      const task = await this.createTaskUseCase.execute(req.body, userId);

      res.status(201).json({
        message: 'Tarea creada exitosamente',
        task
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  };

  /**
   * Obtener tasks con filtrado, ordenamiento y paginación
   * GET /api/tareas
   */
  getTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Usuario no autenticado'
        });
        return;
      }

      // Parsear parámetros de query a filtros
      const filters = this.parseQueryFilters(req.query);

      const result = await this.getTasksUseCase.execute(userId, filters);

      res.status(200).json({
        message: 'Tareas obtenidas exitosamente',
        ...result
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  };

  /**
   * Actualizar una task
   * PUT /api/tareas/:id
   */
  updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const taskId = req.params.id;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Usuario no autenticado'
        });
        return;
      }

      if (!taskId) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'ID de tarea es requerido'
        });
        return;
      }

      const task = await this.updateTaskUseCase.execute(taskId, req.body, userId);

      res.status(200).json({
        message: 'Tarea actualizada exitosamente',
        task
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  };

  /**
   * Eliminar una task
   * DELETE /api/tareas/:id
   */
  deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const taskId = req.params.id;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Usuario no autenticado'
        });
        return;
      }

      if (!taskId) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'ID de tarea es requerido'
        });
        return;
      }

      await this.deleteTaskUseCase.execute(taskId, userId);

      res.status(204).send();
    } catch (error) {
      this.handleError(error, res, next);
    }
  };

  /**
   * Alternar estado de completado de task
   * PATCH /api/tareas/:id/completar
   */
  toggleTaskComplete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const taskId = req.params.id;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Usuario no autenticado'
        });
        return;
      }

      if (!taskId) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'ID de tarea es requerido'
        });
        return;
      }

      const task = await this.toggleTaskCompleteUseCase.execute(taskId, userId);

      res.status(200).json({
        message: 'Estado de tarea actualizado exitosamente',
        task
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  };

  /**
   * Parsear parámetros de query a TaskFiltersDto
   */
  private parseQueryFilters(query: any): TaskFiltersDto {
    const filters: TaskFiltersDto = {};

    // Filtros booleanos
    if (query.completed !== undefined) {
      filters.completed = query.completed === 'true';
    }

    // Filtros de string
    if (query.categoria) {
      filters.category = query.categoria;
    }

    if (query.prioridad) {
      filters.priority = query.prioridad;
    }

    if (query.busqueda) {
      filters.search = query.busqueda;
    }

    // Filtros de rango de fechas
    if (query['fechaVencimiento.desde'] || query['fechaVencimiento.hasta']) {
      filters.dueDate = {};

      if (query['fechaVencimiento.desde']) {
        filters.dueDate.since = query['fechaVencimiento.desde'];
      }

      if (query['fechaVencimiento.hasta']) {
        filters.dueDate.until = query['fechaVencimiento.hasta'];
      }
    }

    // Filtros de array (tags)
    if (query.etiquetas) {
      if (Array.isArray(query.etiquetas)) {
        filters.tags = query.etiquetas;
      } else {
        // ID de tag único como string
        filters.tags = [query.etiquetas];
      }
    }

    // Ordenamiento
    if (query.ordenar) {
      filters.order = query.ordenar;
    }

    if (query.direccion) {
      filters.direction = query.direccion;
    }

    // Paginación
    if (query.limit) {
      const limit = parseInt(query.limit, 10);
      if (!isNaN(limit)) {
        filters.limit = limit;
      }
    }

    if (query.offset) {
      const offset = parseInt(query.offset, 10);
      if (!isNaN(offset)) {
        filters.offset = offset;
      }
    }

    return filters;
  }

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

    if (error instanceof NotFoundError) {
      res.status(404).json({
        error: 'Not Found',
        message: error.message
      });
      return;
    }

    if (error instanceof ForbiddenError) {
      res.status(403).json({
        error: 'Forbidden',
        message: error.message
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
