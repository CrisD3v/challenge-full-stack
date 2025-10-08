import { NextFunction, Request, Response } from 'express';
import { CreateTagUseCase } from '../../../application/use-cases/create-tag.use-case';
import { GetTagsUseCase } from '../../../application/use-cases/get-tags.use-case';
import { Tag } from '../../../domain/entities/tag';
import { ConflictError } from '../../../shared/errors/conflict.error';
import { ValidationError } from '../../../shared/errors/validation.error';
import { TagController } from '../tag.controller';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

describe('TagController', () => {
  let controller: TagController;
  let mockCreateTagUseCase: jest.Mocked<CreateTagUseCase>;
  let mockGetTagsUseCase: jest.Mocked<GetTagsUseCase>;
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockCreateTagUseCase = {
      execute: jest.fn()
    } as any;

    mockGetTagsUseCase = {
      execute: jest.fn()
    } as any;

    controller = new TagController(
      mockCreateTagUseCase,
      mockGetTagsUseCase
    );

    mockRequest = {
      user: { id: 'user-123', email: 'test@example.com' },
      body: {}
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();
  });

  describe('createTag', () => {
    it('should create tag successfully', async () => {
      const tagData = { name: 'urgent' };
      const createdTag = new Tag('tag-123', 'urgent', 'user-123');

      mockRequest.body = tagData;
      mockCreateTagUseCase.execute.mockResolvedValue(createdTag);

      await controller.createTag(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockCreateTagUseCase.execute).toHaveBeenCalledWith({
        name: 'urgent',
        userId: 'user-123'
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Etiqueta creada exitosamente',
        tag: createdTag
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      mockRequest.user = undefined;

      await controller.createTag(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Usuario no autenticado'
      });
      expect(mockCreateTagUseCase.execute).not.toHaveBeenCalled();
    });

    it('should handle validation error', async () => {
      const validationError = new ValidationError('Tag name is required', 'name');
      mockCreateTagUseCase.execute.mockRejectedValue(validationError);

      await controller.createTag(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Validation Error',
        message: 'Tag name is required',
        field: 'name'
      });
    });

    it('should handle conflict error', async () => {
      const conflictError = new ConflictError('Tag already exists');
      mockCreateTagUseCase.execute.mockRejectedValue(conflictError);

      await controller.createTag(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Conflict',
        message: 'Tag already exists'
      });
    });
  });

  describe('getTags', () => {
    it('should get tags successfully', async () => {
      const tags = [
        new Tag('tag-1', 'urgent', 'user-123'),
        new Tag('tag-2', 'important', 'user-123')
      ];

      mockGetTagsUseCase.execute.mockResolvedValue(tags);

      await controller.getTags(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockGetTagsUseCase.execute).toHaveBeenCalledWith('user-123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Etiquetas obtenidas exitosamente',
        tags
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      mockRequest.user = undefined;

      await controller.getTags(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Usuario no autenticado'
      });
      expect(mockGetTagsUseCase.execute).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should pass unexpected errors to next middleware', async () => {
      const unexpectedError = new Error('Unexpected error');
      mockCreateTagUseCase.execute.mockRejectedValue(unexpectedError);

      await controller.createTag(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(unexpectedError);
    });
  });
});
