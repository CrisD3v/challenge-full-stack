import { NextFunction, Request, Response } from 'express';
import { CreateCategoryUseCase } from '../../../application/use-cases/create-category.use-case';
import { DeleteCategoryUseCase } from '../../../application/use-cases/delete-category.use-case';
import { GetCategoriesUseCase } from '../../../application/use-cases/get-categories.use-case';
import { UpdateCategoryUseCase } from '../../../application/use-cases/update-category.use-case';
import { Category } from '../../../domain/entities/category';
import { ConflictError } from '../../../shared/errors/conflict.error';
import { NotFoundError } from '../../../shared/errors/not-found.error';
import { UnauthorizedError } from '../../../shared/errors/unauthorized.error';
import { ValidationError } from '../../../shared/errors/validation.error';
import { CategoryController } from '../category.controller';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

describe('CategoryController', () => {
  let controller: CategoryController;
  let mockCreateCategoryUseCase: jest.Mocked<CreateCategoryUseCase>;
  let mockGetCategoriesUseCase: jest.Mocked<GetCategoriesUseCase>;
  let mockUpdateCategoryUseCase: jest.Mocked<UpdateCategoryUseCase>;
  let mockDeleteCategoryUseCase: jest.Mocked<DeleteCategoryUseCase>;
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockCreateCategoryUseCase = {
      execute: jest.fn()
    } as any;

    mockGetCategoriesUseCase = {
      execute: jest.fn()
    } as any;

    mockUpdateCategoryUseCase = {
      execute: jest.fn()
    } as any;

    mockDeleteCategoryUseCase = {
      execute: jest.fn()
    } as any;

    controller = new CategoryController(
      mockCreateCategoryUseCase,
      mockGetCategoriesUseCase,
      mockUpdateCategoryUseCase,
      mockDeleteCategoryUseCase
    );

    mockRequest = {
      user: { id: 'user-123', email: 'test@example.com' },
      body: {},
      params: {}
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();
  });

  describe('createCategory', () => {
    it('should create category successfully', async () => {
      const categoryData = { name: 'Work', color: '#FF5733' };
      const createdCategory = new Category('cat-123', 'Work', '#FF5733', 'user-123');

      mockRequest.body = categoryData;
      mockCreateCategoryUseCase.execute.mockResolvedValue(createdCategory);

      await controller.createCategory(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockCreateCategoryUseCase.execute).toHaveBeenCalledWith({
        name: 'Work',
        color: '#FF5733',
        userId: 'user-123'
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Categoría creada exitosamente',
        category: createdCategory
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      mockRequest.user = undefined;

      await controller.createCategory(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Usuario no autenticado'
      });
      expect(mockCreateCategoryUseCase.execute).not.toHaveBeenCalled();
    });

    it('should handle validation error', async () => {
      const validationError = new ValidationError('Category name is required', 'name');
      mockCreateCategoryUseCase.execute.mockRejectedValue(validationError);

      await controller.createCategory(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Validation Error',
        message: 'Category name is required',
        field: 'name'
      });
    });

    it('should handle conflict error', async () => {
      const conflictError = new ConflictError('Category already exists');
      mockCreateCategoryUseCase.execute.mockRejectedValue(conflictError);

      await controller.createCategory(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Conflict',
        message: 'Category already exists'
      });
    });
  });

  describe('getCategories', () => {
    it('should get categories successfully', async () => {
      const categories = [
        new Category('cat-1', 'Work', '#FF5733', 'user-123'),
        new Category('cat-2', 'Personal', '#33FF57', 'user-123')
      ];

      mockGetCategoriesUseCase.execute.mockResolvedValue(categories);

      await controller.getCategories(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockGetCategoriesUseCase.execute).toHaveBeenCalledWith('user-123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Categorías obtenidas exitosamente',
        categories
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      mockRequest.user = undefined;

      await controller.getCategories(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Usuario no autenticado'
      });
      expect(mockGetCategoriesUseCase.execute).not.toHaveBeenCalled();
    });
  });

  describe('updateCategory', () => {
    it('should update category successfully', async () => {
      const updateData = { name: 'Updated Work', color: '#FF0000' };
      const updatedCategory = new Category('cat-123', 'Updated Work', '#FF0000', 'user-123');

      mockRequest.params = { id: 'cat-123' };
      mockRequest.body = updateData;
      mockUpdateCategoryUseCase.execute.mockResolvedValue(updatedCategory);

      await controller.updateCategory(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockUpdateCategoryUseCase.execute).toHaveBeenCalledWith('cat-123', 'user-123', updateData);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Categoría actualizada exitosamente',
        category: updatedCategory
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      mockRequest.user = undefined;

      await controller.updateCategory(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockUpdateCategoryUseCase.execute).not.toHaveBeenCalled();
    });

    it('should return 400 when category ID is missing', async () => {
      mockRequest.params = {};

      await controller.updateCategory(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Bad Request',
        message: 'ID de categoría es requerido'
      });
    });

    it('should handle not found error', async () => {
      const notFoundError = new NotFoundError('Category');
      mockRequest.params = { id: 'cat-123' };
      mockUpdateCategoryUseCase.execute.mockRejectedValue(notFoundError);

      await controller.updateCategory(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Not Found',
        message: 'Category not found'
      });
    });

    it('should handle unauthorized error', async () => {
      const unauthorizedError = new UnauthorizedError('You can only update your own categories');
      mockRequest.params = { id: 'cat-123' };
      mockUpdateCategoryUseCase.execute.mockRejectedValue(unauthorizedError);

      await controller.updateCategory(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Forbidden',
        message: 'You can only update your own categories'
      });
    });
  });

  describe('deleteCategory', () => {
    it('should delete category successfully', async () => {
      mockRequest.params = { id: 'cat-123' };
      mockDeleteCategoryUseCase.execute.mockResolvedValue();

      await controller.deleteCategory(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockDeleteCategoryUseCase.execute).toHaveBeenCalledWith('cat-123', 'user-123');
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', async () => {
      mockRequest.user = undefined;

      await controller.deleteCategory(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockDeleteCategoryUseCase.execute).not.toHaveBeenCalled();
    });

    it('should return 400 when category ID is missing', async () => {
      mockRequest.params = {};

      await controller.deleteCategory(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Bad Request',
        message: 'ID de categoría es requerido'
      });
    });

    it('should handle not found error', async () => {
      const notFoundError = new NotFoundError('Category');
      mockRequest.params = { id: 'cat-123' };
      mockDeleteCategoryUseCase.execute.mockRejectedValue(notFoundError);

      await controller.deleteCategory(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Not Found',
        message: 'Category not found'
      });
    });
  });

  describe('error handling', () => {
    it('should pass unexpected errors to next middleware', async () => {
      const unexpectedError = new Error('Unexpected error');
      mockCreateCategoryUseCase.execute.mockRejectedValue(unexpectedError);

      await controller.createCategory(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(unexpectedError);
    });
  });
});
