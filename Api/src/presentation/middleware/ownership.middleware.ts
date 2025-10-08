import { NextFunction, Request, Response } from 'express';
import { TaskRepository } from '../../domain/repositories/task.repository';

export class OwnershipMiddleware {
  constructor(private readonly taskRepository: TaskRepository) { }

  /**
   * Middleware para validar la propiedad de la tarea
   * Verifica si la tarea existe y pertenece al usuario autenticado
   */
  validateTaskOwnership = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      // Verificar si la tarea existe
      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Tarea no encontrada'
        });
        return;
      }

      // Verificar propiedad
      if (!task.belongsToUser(userId)) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'No tienes permisos para acceder a esta tarea'
        });
        return;
      }

      // Almacenar tarea en request para uso en controller
      req.task = task;
      next();
    } catch (error) {
      next(error);
    }
  };
}

// Extender interfaz Request de Express para incluir task
declare global {
  namespace Express {
    interface Request {
      task?: any;
    }
  }
}

// Función factory para crear instancia del middleware
export const createOwnershipMiddleware = (taskRepository: TaskRepository) => {
  const ownershipMiddleware = new OwnershipMiddleware(taskRepository);
  return ownershipMiddleware.validateTaskOwnership;
};
