import { Category } from '../../../domain/entities/category';
import { CategoryRepository } from '../../../domain/repositories/category.repository';
import { ValidationError } from '../../../shared/errors/validation.error';
import { GetCategoriesUseCase } from '../get-categories.use-case';

// Mock the logger
jest.mock('../../../infrastructure/logging/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('GetCategoriesUseCase', () => {
  let useCase: GetCategoriesUseCase;
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

    useCase = new GetCategoriesUseCase(mockCategoryRepository);
  });

  describe('execute', () => {
    const userId = 'user-123';
    const mockCategories = [
      new Category('cat-1', 'Work', '#FF0000', userId),
      new Category('cat-2', 'Personal', '#00FF00', userId),
      new Category('cat-3', 'Shopping', null, userId),
    ];

    it('should retrieve categories successfully for valid user ID', async () => {
      mockCategoryRepository.findByUserId.mockResolvedValue(mockCategories);

      const result = await useCase.execute(userId);

      expect(result).toEqual(mockCategories);
      expect(mockCategoryRepository.findByUserId).toHaveBeenCalledWith(userId);
    });

    it('should return empty array when user has no categories', async () => {
      mockCategoryRepository.findByUserId.mockResolvedValue([]);

      const result = await useCase.execute(userId);

      expect(result).toEqual([]);
      expect(mockCategoryRepository.findByUserId).toHaveBeenCalledWith(userId);
    });

    it('should throw ValidationError when userId is empty', async () => {
      await expect(useCase.execute('')).rejects.toThrow(ValidationError);
      await expect(useCase.execute('')).rejects.toThrow('User ID is required');
      expect(mockCategoryRepository.findByUserId).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when userId is only whitespace', async () => {
      await expect(useCase.execute('   ')).rejects.toThrow(ValidationError);
      await expect(useCase.execute('   ')).rejects.toThrow('User ID is required');
      expect(mockCategoryRepository.findByUserId).not.toHaveBeenCalled();
    });

    it('should propagate repository errors', async () => {
      const dbError = new Error('Database connection failed');
      mockCategoryRepository.findByUserId.mockRejectedValue(dbError);

      await expect(useCase.execute(userId)).rejects.toThrow('Database connection failed');
      expect(mockCategoryRepository.findByUserId).toHaveBeenCalledWith(userId);
    });

    it('should handle categories with different properties correctly', async () => {
      const diverseCategories = [
        new Category('cat-1', 'Work', '#FF0000', userId),
        new Category('cat-2', 'Personal', null, userId), // No color
        new Category('cat-3', 'A very long category name that is still valid', '#123456', userId),
      ];

      mockCategoryRepository.findByUserId.mockResolvedValue(diverseCategories);

      const result = await useCase.execute(userId);

      expect(result).toEqual(diverseCategories);
      expect(result).toHaveLength(3);
      expect(result[0]?.color).toBe('#FF0000');
      expect(result[1]?.color).toBeNull();
      expect(result[2]?.name).toBe('A very long category name that is still valid');
    });
  });
});
