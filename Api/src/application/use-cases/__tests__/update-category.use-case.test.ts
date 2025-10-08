import { Category } from '../../../domain/entities/category';
import { CategoryRepository } from '../../../domain/repositories/category.repository';
import { UpdateCategoryDto } from '../../../domain/repositories/types';
import { ConflictError } from '../../../shared/errors/conflict.error';
import { NotFoundError } from '../../../shared/errors/not-found.error';
import { UnauthorizedError } from '../../../shared/errors/unauthorized.error';
import { ValidationError } from '../../../shared/errors/validation.error';
import { UpdateCategoryUseCase } from '../update-category.use-case';

// Mock the logger
jest.mock('../../../infrastructure/logging/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('UpdateCategoryUseCase', () => {
  let useCase: UpdateCategoryUseCase;
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

    useCase = new UpdateCategoryUseCase(mockCategoryRepository);
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

    const updatedCategory = new Category(
      categoryId,
      'Updated Work',
      '#00FF00',
      userId
    );

    it('should update category successfully with valid data and ownership', async () => {
      const updates: UpdateCategoryDto = {
        name: 'Updated Work',
        color: '#00FF00',
      };

      mockCategoryRepository.findById.mockResolvedValue(existingCategory);
      mockCategoryRepository.update.mockResolvedValue(updatedCategory);

      const result = await useCase.execute(categoryId, userId, updates);

      expect(result).toEqual(updatedCategory);
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(categoryId);
      expect(mockCategoryRepository.update).toHaveBeenCalledWith(categoryId, updates);
    });

    it('should update only name when only name is provided', async () => {
      const updates: UpdateCategoryDto = {
        name: 'Updated Work',
      };

      const partiallyUpdatedCategory = new Category(
        categoryId,
        'Updated Work',
        '#FF0000', // Original color preserved
        userId
      );

      mockCategoryRepository.findById.mockResolvedValue(existingCategory);
      mockCategoryRepository.update.mockResolvedValue(partiallyUpdatedCategory);

      const result = await useCase.execute(categoryId, userId, updates);

      expect(result).toEqual(partiallyUpdatedCategory);
      expect(mockCategoryRepository.update).toHaveBeenCalledWith(categoryId, updates);
    });

    it('should update only color when only color is provided', async () => {
      const updates: UpdateCategoryDto = {
        color: '#00FF00',
      };

      const partiallyUpdatedCategory = new Category(
        categoryId,
        'Work', // Original name preserved
        '#00FF00',
        userId
      );

      mockCategoryRepository.findById.mockResolvedValue(existingCategory);
      mockCategoryRepository.update.mockResolvedValue(partiallyUpdatedCategory);

      const result = await useCase.execute(categoryId, userId, updates);

      expect(result).toEqual(partiallyUpdatedCategory);
      expect(mockCategoryRepository.update).toHaveBeenCalledWith(categoryId, updates);
    });

    it('should allow setting color to null', async () => {
      const updates: UpdateCategoryDto = {
        color: null,
      };

      const categoryWithoutColor = new Category(
        categoryId,
        'Work',
        null,
        userId
      );

      mockCategoryRepository.findById.mockResolvedValue(existingCategory);
      mockCategoryRepository.update.mockResolvedValue(categoryWithoutColor);

      const result = await useCase.execute(categoryId, userId, updates);

      expect(result).toEqual(categoryWithoutColor);
      expect(mockCategoryRepository.update).toHaveBeenCalledWith(categoryId, updates);
    });

    it('should throw NotFoundError when category does not exist', async () => {
      const updates: UpdateCategoryDto = { name: 'Updated Work' };

      mockCategoryRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(categoryId, userId, updates)).rejects.toThrow(NotFoundError);
      await expect(useCase.execute(categoryId, userId, updates)).rejects.toThrow('Category not found');
      expect(mockCategoryRepository.update).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedError when user does not own the category', async () => {
      const updates: UpdateCategoryDto = { name: 'Updated Work' };

      mockCategoryRepository.findById.mockResolvedValue(existingCategory);

      await expect(useCase.execute(categoryId, otherUserId, updates)).rejects.toThrow(UnauthorizedError);
      await expect(useCase.execute(categoryId, otherUserId, updates)).rejects.toThrow('You can only update your own categories');
      expect(mockCategoryRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when categoryId is empty', async () => {
      const updates: UpdateCategoryDto = { name: 'Updated Work' };

      await expect(useCase.execute('', userId, updates)).rejects.toThrow(ValidationError);
      await expect(useCase.execute('', userId, updates)).rejects.toThrow('Category ID is required');
      expect(mockCategoryRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when userId is empty', async () => {
      const updates: UpdateCategoryDto = { name: 'Updated Work' };

      await expect(useCase.execute(categoryId, '', updates)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(categoryId, '', updates)).rejects.toThrow('User ID is required');
      expect(mockCategoryRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when name is empty string', async () => {
      const updates: UpdateCategoryDto = { name: '' };

      await expect(useCase.execute(categoryId, userId, updates)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(categoryId, userId, updates)).rejects.toThrow('Category name cannot be empty');
      expect(mockCategoryRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when name is only whitespace', async () => {
      const updates: UpdateCategoryDto = { name: '   ' };

      await expect(useCase.execute(categoryId, userId, updates)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(categoryId, userId, updates)).rejects.toThrow('Category name cannot be empty');
      expect(mockCategoryRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when name exceeds 255 characters', async () => {
      const updates: UpdateCategoryDto = { name: 'a'.repeat(256) };

      await expect(useCase.execute(categoryId, userId, updates)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(categoryId, userId, updates)).rejects.toThrow('Category name cannot exceed 255 characters');
      expect(mockCategoryRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when color is invalid hex format', async () => {
      const updates: UpdateCategoryDto = { color: 'invalid-color' };

      await expect(useCase.execute(categoryId, userId, updates)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(categoryId, userId, updates)).rejects.toThrow('Color must be a valid hex color code');
      expect(mockCategoryRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when no updates are provided', async () => {
      const updates: UpdateCategoryDto = {};

      await expect(useCase.execute(categoryId, userId, updates)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(categoryId, userId, updates)).rejects.toThrow('At least one field must be provided for update');
      expect(mockCategoryRepository.findById).not.toHaveBeenCalled();
    });

    it('should accept valid hex colors in different cases', async () => {
      const validColors = ['#FF0000', '#ff0000', '#AbCdEf'];

      mockCategoryRepository.findById.mockResolvedValue(existingCategory);

      for (const color of validColors) {
        const updates: UpdateCategoryDto = { color };
        const categoryWithColor = new Category(categoryId, 'Work', color, userId);

        mockCategoryRepository.update.mockResolvedValue(categoryWithColor);

        await expect(useCase.execute(categoryId, userId, updates)).resolves.toEqual(categoryWithColor);
      }
    });

    it('should propagate ConflictError from repository when name already exists', async () => {
      const updates: UpdateCategoryDto = { name: 'Existing Category' };
      const conflictError = new ConflictError('Category name already exists for this user');

      mockCategoryRepository.findById.mockResolvedValue(existingCategory);
      mockCategoryRepository.update.mockRejectedValue(conflictError);

      await expect(useCase.execute(categoryId, userId, updates)).rejects.toThrow(ConflictError);
      await expect(useCase.execute(categoryId, userId, updates)).rejects.toThrow('Category name already exists for this user');
    });

    it('should propagate other repository errors', async () => {
      const updates: UpdateCategoryDto = { name: 'Updated Work' };
      const dbError = new Error('Database connection failed');

      mockCategoryRepository.findById.mockResolvedValue(existingCategory);
      mockCategoryRepository.update.mockRejectedValue(dbError);

      await expect(useCase.execute(categoryId, userId, updates)).rejects.toThrow('Database connection failed');
    });
  });
});
