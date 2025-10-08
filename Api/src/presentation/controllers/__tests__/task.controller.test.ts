import { NextFunction, Request, Response } from 'express';
import { GetTasksResponseDto, TaskResponseDto } from '../../../application/dto/task.dto';
import { CreateTaskUseCase } from '../../../application/use-cases/create-task.use-case';
import { DeleteTaskUseCase } from '../../../application/use-cases/delete-task.use-case';
import { GetTasksUseCase } from '../../../application/use-cases/get-tasks.use-case';
import { ToggleTaskCompleteUseCase } from '../../../application/use-cases/toggle-task-complete.use-case';
import { UpdateTaskUseCase } from '../../../application/use-cases/update-task.use-case';
import { PriorityLevel } from '../../../domain/value-objects/priority';
import { ForbiddenError } from '../../../shared/errors/forbidden.error';
import { NotFoundError } from '../../../shared/errors/not-found.error';
import { ValidationError } from '../../../shared/errors/validation.error';
import { TaskController } from '../task.controller';

// Mock use cases
const mockCreateTaskUseCase = {
  execute: jest.fn()
} as unknown as jest.Mocked<CreateTaskUseCase>;

const mockGetTasksUseCase = {
  execute: jest.fn()
} as unknown as jest.Mocked<GetTasksUseCase>;

const mockUpdateTaskUseCase = {
  execute: jest.fn()
} as unknown as jest.Mocked<UpdateTaskUseCase>;

const mockDeleteTaskUseCase = {
  execute: jest.fn()
} as unknown as jest.Mocked<DeleteTaskUseCase>;

const mockToggleTaskCompleteUseCase = {
  execute: jest.fn()
} as unknown as jest.Mocked<ToggleTaskCompleteUseCase>;

// Mock Express objects
const mockRequest = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  user: { id: 'user-123', email: 'test@example.com' },
  ...overrides
}) as unknown as Request;

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn() as NextFunction;

describe('TaskController', () => {
  let taskController: TaskController;

  beforeEach(() => {
    taskController = new TaskController(
      mockCreateTaskUseCase,
      mockGetTasksUseCase,
      mockUpdateTaskUseCase,
      mockDeleteTaskUseCase,
      mockToggleTaskCompleteUseCase
    );

    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('should create task successfully', async () => {
      const req = mockRequest({
        body: {
          title: 'Test Task',
          description: 'Test Description'
        }
      });
      const res = mockResponse();

      const mockTask: TaskResponseDto = {
        id: 'task-123',
        title: 'Test Task',
        description: 'Test Description',
        completed: false,
        priority: 'media' as PriorityLevel,
        dueDate: null,
        userId: 'user-123',
        categoryId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockCreateTaskUseCase.execute.mockResolvedValue(mockTask);

      await taskController.createTask(req, res, mockNext);

      expect(mockCreateTaskUseCase.execute).toHaveBeenCalledWith(req.body, 'user-123');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Tarea creada exitosamente',
        task: mockTask
      });
    });

    it('should return 401 if user not authenticated', async () => {
      const req = mockRequest({ user: undefined });
      const res = mockResponse();

      await taskController.createTask(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Usuario no autenticado'
      });
    });

    it('should handle validation errors', async () => {
      const req = mockRequest({
        body: { title: '' }
      });
      const res = mockResponse();

      mockCreateTaskUseCase.execute.mockRejectedValue(
        new ValidationError('Task title is required', 'title')
      );

      await taskController.createTask(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Validation Error',
        message: 'Task title is required',
        field: 'title'
      });
    });
  });

  describe('getTasks', () => {
    it('should get tasks successfully', async () => {
      const req = mockRequest({
        query: {
          completed: 'false',
          prioridad: 'alta',
          limit: '10',
          offset: '0'
        }
      });
      const res = mockResponse();

      const mockResult: GetTasksResponseDto = {
        tasks: [
          {
            id: 'task-123',
            title: 'Test Task',
            description: 'Test Description',
            completed: false,
            priority: 'alta' as PriorityLevel,
            dueDate: null,
            userId: 'user-123',
            categoryId: null,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        total: 1,
        limit: 10,
        offset: 0
      };

      mockGetTasksUseCase.execute.mockResolvedValue(mockResult);

      await taskController.getTasks(req, res, mockNext);

      expect(mockGetTasksUseCase.execute).toHaveBeenCalledWith('user-123', {
        completed: false,
        priority: 'alta',
        limit: 10,
        offset: 0
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Tareas obtenidas exitosamente',
        ...mockResult
      });
    });

    it('should parse date range filters correctly', async () => {
      const req = mockRequest({
        query: {
          'fechaVencimiento.desde': '2024-01-01',
          'fechaVencimiento.hasta': '2024-12-31'
        }
      });
      const res = mockResponse();

      const mockResult: GetTasksResponseDto = {
        tasks: [],
        total: 0,
        limit: 50,
        offset: 0
      };

      mockGetTasksUseCase.execute.mockResolvedValue(mockResult);

      await taskController.getTasks(req, res, mockNext);

      expect(mockGetTasksUseCase.execute).toHaveBeenCalledWith('user-123', {
        dueDate: {
          since: '2024-01-01',
          until: '2024-12-31'
        }
      });
    });

    it('should parse tag filters correctly', async () => {
      const req = mockRequest({
        query: {
          etiquetas: ['tag-1', 'tag-2']
        }
      });
      const res = mockResponse();

      const mockResult: GetTasksResponseDto = {
        tasks: [],
        total: 0,
        limit: 50,
        offset: 0
      };

      mockGetTasksUseCase.execute.mockResolvedValue(mockResult);

      await taskController.getTasks(req, res, mockNext);

      expect(mockGetTasksUseCase.execute).toHaveBeenCalledWith('user-123', {
        tags: ['tag-1', 'tag-2']
      });
    });

    it('should handle single tag as string', async () => {
      const req = mockRequest({
        query: {
          etiquetas: 'tag-1'
        }
      });
      const res = mockResponse();

      const mockResult: GetTasksResponseDto = {
        tasks: [],
        total: 0,
        limit: 50,
        offset: 0
      };

      mockGetTasksUseCase.execute.mockResolvedValue(mockResult);

      await taskController.getTasks(req, res, mockNext);

      expect(mockGetTasksUseCase.execute).toHaveBeenCalledWith('user-123', {
        tags: ['tag-1']
      });
    });

    it('should return 401 if user not authenticated', async () => {
      const req = mockRequest({ user: undefined });
      const res = mockResponse();

      await taskController.getTasks(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Usuario no autenticado'
      });
    });

    it('should parse all filter types correctly', async () => {
      const req = mockRequest({
        query: {
          completed: 'true',
          categoria: 'trabajo',
          prioridad: 'alta',
          busqueda: 'test search',
          ordenar: 'created_at',
          direccion: 'desc',
          limit: '25',
          offset: '10'
        }
      });
      const res = mockResponse();

      const mockResult: GetTasksResponseDto = {
        tasks: [],
        total: 0,
        limit: 25,
        offset: 10
      };

      mockGetTasksUseCase.execute.mockResolvedValue(mockResult);

      await taskController.getTasks(req, res, mockNext);

      expect(mockGetTasksUseCase.execute).toHaveBeenCalledWith('user-123', {
        completed: true,
        category: 'trabajo',
        priority: 'alta',
        search: 'test search',
        order: 'created_at',
        direction: 'desc',
        limit: 25,
        offset: 10
      });
    });
  });

  describe('updateTask', () => {
    it('should update task successfully', async () => {
      const req = mockRequest({
        params: { id: 'task-123' },
        body: { title: 'Updated Task' }
      });
      const res = mockResponse();

      const mockTask: TaskResponseDto = {
        id: 'task-123',
        title: 'Updated Task',
        description: 'Test Description',
        completed: false,
        priority: 'media' as PriorityLevel,
        dueDate: null,
        userId: 'user-123',
        categoryId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUpdateTaskUseCase.execute.mockResolvedValue(mockTask);

      await taskController.updateTask(req, res, mockNext);

      expect(mockUpdateTaskUseCase.execute).toHaveBeenCalledWith('task-123', req.body, 'user-123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Tarea actualizada exitosamente',
        task: mockTask
      });
    });

    it('should handle not found errors', async () => {
      const req = mockRequest({
        params: { id: 'nonexistent-task' },
        body: { title: 'Updated Task' }
      });
      const res = mockResponse();

      mockUpdateTaskUseCase.execute.mockRejectedValue(
        new NotFoundError('Task', 'nonexistent-task')
      );

      await taskController.updateTask(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Not Found',
        message: "Task with id 'nonexistent-task' not found"
      });
    });

    it('should handle forbidden errors', async () => {
      const req = mockRequest({
        params: { id: 'task-123' },
        body: { title: 'Updated Task' }
      });
      const res = mockResponse();

      mockUpdateTaskUseCase.execute.mockRejectedValue(
        new ForbiddenError('You can only update your own tasks')
      );

      await taskController.updateTask(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Forbidden',
        message: 'You can only update your own tasks'
      });
    });

    it('should return 401 if user not authenticated', async () => {
      const req = mockRequest({
        user: undefined,
        params: { id: 'task-123' },
        body: { title: 'Updated Task' }
      });
      const res = mockResponse();

      await taskController.updateTask(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Usuario no autenticado'
      });
    });

    it('should return 400 if task ID is missing', async () => {
      const req = mockRequest({
        params: {},
        body: { title: 'Updated Task' }
      });
      const res = mockResponse();

      await taskController.updateTask(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Bad Request',
        message: 'ID de tarea es requerido'
      });
    });
  });

  describe('deleteTask', () => {
    it('should delete task successfully', async () => {
      const req = mockRequest({
        params: { id: 'task-123' }
      });
      const res = mockResponse();

      mockDeleteTaskUseCase.execute.mockResolvedValue(undefined);

      await taskController.deleteTask(req, res, mockNext);

      expect(mockDeleteTaskUseCase.execute).toHaveBeenCalledWith('task-123', 'user-123');
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should return 401 if user not authenticated', async () => {
      const req = mockRequest({
        user: undefined,
        params: { id: 'task-123' }
      });
      const res = mockResponse();

      await taskController.deleteTask(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Usuario no autenticado'
      });
    });

    it('should return 400 if task ID is missing', async () => {
      const req = mockRequest({
        params: {}
      });
      const res = mockResponse();

      await taskController.deleteTask(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Bad Request',
        message: 'ID de tarea es requerido'
      });
    });

    it('should handle not found errors', async () => {
      const req = mockRequest({
        params: { id: 'nonexistent-task' }
      });
      const res = mockResponse();

      mockDeleteTaskUseCase.execute.mockRejectedValue(
        new NotFoundError('Task', 'nonexistent-task')
      );

      await taskController.deleteTask(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Not Found',
        message: "Task with id 'nonexistent-task' not found"
      });
    });

    it('should handle forbidden errors', async () => {
      const req = mockRequest({
        params: { id: 'task-123' }
      });
      const res = mockResponse();

      mockDeleteTaskUseCase.execute.mockRejectedValue(
        new ForbiddenError('You can only delete your own tasks')
      );

      await taskController.deleteTask(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Forbidden',
        message: 'You can only delete your own tasks'
      });
    });
  });

  describe('toggleTaskComplete', () => {
    it('should toggle task completion successfully', async () => {
      const req = mockRequest({
        params: { id: 'task-123' }
      });
      const res = mockResponse();

      const mockTask: TaskResponseDto = {
        id: 'task-123',
        title: 'Test Task',
        description: 'Test Description',
        completed: true,
        priority: 'media' as PriorityLevel,
        dueDate: null,
        userId: 'user-123',
        categoryId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockToggleTaskCompleteUseCase.execute.mockResolvedValue(mockTask);

      await taskController.toggleTaskComplete(req, res, mockNext);

      expect(mockToggleTaskCompleteUseCase.execute).toHaveBeenCalledWith('task-123', 'user-123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Estado de tarea actualizado exitosamente',
        task: mockTask
      });
    });

    it('should return 401 if user not authenticated', async () => {
      const req = mockRequest({
        user: undefined,
        params: { id: 'task-123' }
      });
      const res = mockResponse();

      await taskController.toggleTaskComplete(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Usuario no autenticado'
      });
    });

    it('should return 400 if task ID is missing', async () => {
      const req = mockRequest({
        params: {}
      });
      const res = mockResponse();

      await taskController.toggleTaskComplete(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Bad Request',
        message: 'ID de tarea es requerido'
      });
    });

    it('should handle not found errors', async () => {
      const req = mockRequest({
        params: { id: 'nonexistent-task' }
      });
      const res = mockResponse();

      mockToggleTaskCompleteUseCase.execute.mockRejectedValue(
        new NotFoundError('Task', 'nonexistent-task')
      );

      await taskController.toggleTaskComplete(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Not Found',
        message: "Task with id 'nonexistent-task' not found"
      });
    });

    it('should handle forbidden errors', async () => {
      const req = mockRequest({
        params: { id: 'task-123' }
      });
      const res = mockResponse();

      mockToggleTaskCompleteUseCase.execute.mockRejectedValue(
        new ForbiddenError('You can only modify your own tasks')
      );

      await taskController.toggleTaskComplete(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Forbidden',
        message: 'You can only modify your own tasks'
      });
    });
  });

  describe('error handling', () => {
    it('should pass unexpected errors to next middleware', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const unexpectedError = new Error('Unexpected error');

      mockCreateTaskUseCase.execute.mockRejectedValue(unexpectedError);

      await taskController.createTask(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(unexpectedError);
    });

    it('should handle conflict errors', async () => {
      const req = mockRequest({
        body: { title: 'Test Task' }
      });
      const res = mockResponse();

      const { ConflictError } = require('../../../shared/errors/conflict.error');
      mockCreateTaskUseCase.execute.mockRejectedValue(
        new ConflictError('Task already exists')
      );

      await taskController.createTask(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Conflict',
        message: 'Task already exists'
      });
    });
  });
});
