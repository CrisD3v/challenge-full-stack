import { Router } from 'express';
import { TaskRepository } from '../../domain/repositories/task.repository';
import { createAuthMiddleware } from '../../infrastructure/middleware/auth.middleware';
import { IJWTService } from '../../infrastructure/security/jwt.service';
import { TaskController } from '../controllers/task.controller';
import { createOwnershipMiddleware } from '../middleware/ownership.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createTaskValidation,
  getTasksValidation,
  taskIdValidation,
  updateTaskValidation
} from '../validators/task.validator';

export const createTaskRoutes = (
  taskController: TaskController,
  jwtService: IJWTService,
  taskRepository: TaskRepository
): Router => {
  const router = Router();

  // Create middleware instances
  const authMiddleware = createAuthMiddleware(jwtService);
  const ownershipMiddleware = createOwnershipMiddleware(taskRepository);

  // GET /api/tareas - Get tasks with filtering, sorting, and pagination
  router.get(
    '/',
    authMiddleware,
    validate(getTasksValidation),
    taskController.getTasks
  );

  // POST /api/tareas - Create a new task
  router.post(
    '/',
    authMiddleware,
    validate(createTaskValidation),
    taskController.createTask
  );

  // PUT /api/tareas/:id - Update a task
  router.put(
    '/:id',
    authMiddleware,
    validate(updateTaskValidation),
    taskController.updateTask
  );

  // DELETE /api/tareas/:id - Delete a task
  router.delete(
    '/:id',
    authMiddleware,
    validate(taskIdValidation),
    taskController.deleteTask
  );

  // PATCH /api/tareas/:id/completar - Toggle task completion status
  router.patch(
    '/:id/completar',
    authMiddleware,
    validate(taskIdValidation),
    taskController.toggleTaskComplete
  );

  return router;
};
