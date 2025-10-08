import { Category } from '../../../domain/entities/category';
import { CategoryRepository } from '../../../domain/repositories/category.repository';
import { NotFoundError } from '../../../shared/errors/not-found.error';
import { UnauthorizedError } from '../../../shared/errors/unauthorized.error';
import { ValidationError } from '../../../shared/errors/validation.error';
import { DeleteCategoryUseCase } from '../delete-category.use-case';

// Mock the logger
jest.mock('../../../infrastructure/logging/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('DeleteCategoryUseCase', () => {
  let useCase: DeleteCategoryUseCase;
  let mockCategoryRepository: jest.Mocked<CategoryRepository>;

  beforeEach(() => {
    mockCategoryRepository = {
      create: jest.fn(),
      findByUserId: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      existsByNameForUser: jest.fn(),
    };

    useCase = new DeleteCategoryUseCase(mockCategoryRepository);
  });

  describe('execute', () => {
    const categoryId = 'category-123';
    const userId = 'user-123';
    const otherUserId = 'user-456';

    const existingCategory = new Category(
      categoryId,
      'Work',
      '#FF0000',
      userId
    );

    const otherUserCategory = new Category(
      categoryId,
      'Work',
      '#FF0000',
      otherUserId
    );

    it('should delete category successfully with valid data and ownership', async () => {
      mockCategoryRepository.findById.mockResolvedValue(existingCategory);
      mockCategoryRepository.delete.mockResolvedValue();

      await useCase.execute(categoryId, userId);

      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(categoryId);
      expect(mockCategoryRepository.delete).toHaveBeenCalledWith(categoryId);
    });

    it('should throw NotFoundError when category does not exist', async () => {
      mockCategoryRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(categoryId, userId)).rejects.toThrow(NotFoundError);
      await expect(useCase.execute(categoryId, userId)).rejects.toThrow('Category not found');
      expect(mockCategoryRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedError when user does not own the category', async () => {
      mockCategoryRepository.findById.mockResolvedValue(otherUserCategory);

      await expect(useCase.execute(categoryId, userId)).rejects.toThrow(UnauthorizedError);
      await expect(useCase.execute(categoryId, userId)).rejects.toThrow('You can only delete your own categories');
      expect(mockCategoryRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when categoryId is empty', async () => {
      await expect(useCase.execute('', userId)).rejects.toThrow(ValidationError);
      await expect(useCase.execute('', userId)).rejects.toThrow('Category ID is required');
      expect(mockCategoryRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when categoryId is only whitespace', async () => {
      await expect(useCase.execute('   ', userId)).rejects.toThrow(ValidationError);
      await expect(useCase.execute('   ', userId)).rejects.toThrow('Category ID is required');
      expect(mockCategoryRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when userId is empty', async () => {
      await expect(useCase.execute(categoryId, '')).rejects.toThrow(ValidationError);
      await expect(useCase.execute(categoryId, '')).rejects.toThrow('User ID is required');
      expect(mockCategoryRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when userId is only whitespace', async () => {
      await expect(useCase.execute(categoryId, '   ')).rejects.toThrow(ValidationError);
      await expect(useCase.execute(categoryId, '   ')).rejects.toThrow('User ID is required');
      expect(mockCategoryRepository.findById).not.toHaveBeenCalled();
    });

    it('should handle categories with different properties correctly', async () => {
      const categoryWithoutColor = new Category(
        'cat-no-color',
        'Personal',
        null,
        userId
      );

      mockCategoryRepository.findById.mockResolvedValue(categoryWithoutColor);
      mockCategoryRepository.delete.mockResolvedValue();

      await useCase.execute('cat-no-color', userId);

      expect(mockCategoryRepository.findById).toHaveBeenCalledWith('cat-no-color');
      expect(mockCategoryRepository.delete).toHaveBeenCalledWith('cat-no-color');
    });

    it('should propagate repository errors from findById', async () => {
      const dbError = new Error('Database connection failed');
      mockCategoryRepository.findById.mockRejectedValue(dbError);

      await expect(useCase.execute(categoryId, userId)).rejects.toThrow('Database connection failed');
      expect(mockCategoryRepository.delete).not.toHaveBeenCalled();
    });

    it('should propagate repository errors from delete', async () => {
      const dbError = new Error('Database connection failed');
      mockCategoryRepository.findById.mockResolvedValue(existingCategory);
      mockCategoryRepository.delete.mockRejectedValue(dbError);

      await expect(useCase.execute(categoryId, userId)).rejects.toThrow('Database connection failed');
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(categoryId);
      expect(mockCategoryRepository.delete).toHaveBeenCalledWith(categoryId);
    });

    it('should propagate NotFoundError from repository delete method', async () => {
      const notFoundError = new NotFoundError('Category not found');
      mockCategoryRepository.findById.mockResolvedValue(existingCategory);
      mockCategoryRepository.delete.mockRejectedValue(notFoundError);

      await expect(useCase.execute(categoryId, userId)).rejects.toThrow(NotFoundError);
      expect(mockCategoryRepository.delete).toHaveBeenCalledWith(categoryId);
    });

    it('should verify ownership before attempting deletion', async () => {
      // This test ensures the ownership check happens before the delete operation
      mockCategoryRepository.findById.mockResolvedValue(otherUserCategory);

      await expect(useCase.execute(categoryId, userId)).rejects.toThrow(UnauthorizedError);

      // Verify that delete was never called since ownership check failed
      expect(mockCategoryRepository.delete).not.toHaveBeenCalled();
    });
  });
});
