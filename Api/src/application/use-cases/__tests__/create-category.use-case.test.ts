import { Category } from '../../../domain/entities/category';
import { CategoryRepository } from '../../../domain/repositories/category.repository';
import { CreateCategoryDto } from '../../../domain/repositories/types';
import { ConflictError } from '../../../shared/errors/conflict.error';
import { ValidationError } from '../../../shared/errors/validation.error';
import { CreateCategoryUseCase } from '../create-category.use-case';

// Mock the logger
jest.mock('../../../infrastructure/logging/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('CreateCategoryUseCase', () => {
  let useCase: CreateCategoryUseCase;
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

    useCase = new CreateCategoryUseCase(mockCategoryRepository);
  });

  describe('execute', () => {
    const validDto: CreateCategoryDto = {
      name: 'Work',
      color: '#FF0000',
      userId: 'user-123',
    };

    const expectedCategory = new Category(
      'category-123',
      'Work',
      '#FF0000',
      'user-123'
    );

    it('should create a category successfully with valid data', async () => {
      mockCategoryRepository.create.mockResolvedValue(expectedCategory);

      const result = await useCase.execute(validDto);

      expect(result).toEqual(expectedCategory);
      expect(mockCategoryRepository.create).toHaveBeenCalledWith(validDto);
    });

    it('should create a category without color', async () => {
      const dtoWithoutColor: CreateCategoryDto = {
        name: 'Personal',
        userId: 'user-123',
      };

      const categoryWithoutColor = new Category(
        'category-124',
        'Personal',
        null,
        'user-123'
      );

      mockCategoryRepository.create.mockResolvedValue(categoryWithoutColor);

      const result = await useCase.execute(dtoWithoutColor);

      expect(result).toEqual(categoryWithoutColor);
      expect(mockCategoryRepository.create).toHaveBeenCalledWith(dtoWithoutColor);
    });

    it('should throw ValidationError when name is empty', async () => {
      const invalidDto: CreateCategoryDto = {
        name: '',
        userId: 'user-123',
      };

      await expect(useCase.execute(invalidDto)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(invalidDto)).rejects.toThrow('Category name is required');
      expect(mockCategoryRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when name is only whitespace', async () => {
      const invalidDto: CreateCategoryDto = {
        name: '   ',
        userId: 'user-123',
      };

      await expect(useCase.execute(invalidDto)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(invalidDto)).rejects.toThrow('Category name is required');
      expect(mockCategoryRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when name exceeds 255 characters', async () => {
      const invalidDto: CreateCategoryDto = {
        name: 'a'.repeat(256),
        userId: 'user-123',
      };

      await expect(useCase.execute(invalidDto)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(invalidDto)).rejects.toThrow('Category name cannot exceed 255 characters');
      expect(mockCategoryRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when userId is empty', async () => {
      const invalidDto: CreateCategoryDto = {
        name: 'Work',
        userId: '',
      };

      await expect(useCase.execute(invalidDto)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(invalidDto)).rejects.toThrow('User ID is required');
      expect(mockCategoryRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when color is invalid hex format', async () => {
      const invalidDto: CreateCategoryDto = {
        name: 'Work',
        color: 'invalid-color',
        userId: 'user-123',
      };

      await expect(useCase.execute(invalidDto)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(invalidDto)).rejects.toThrow('Color must be a valid hex color code');
      expect(mockCategoryRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when color is incomplete hex', async () => {
      const invalidDto: CreateCategoryDto = {
        name: 'Work',
        color: '#FF00',
        userId: 'user-123',
      };

      await expect(useCase.execute(invalidDto)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(invalidDto)).rejects.toThrow('Color must be a valid hex color code');
      expect(mockCategoryRepository.create).not.toHaveBeenCalled();
    });

    it('should accept valid hex colors in different cases', async () => {
      const validColors = ['#FF0000', '#ff0000', '#AbCdEf'];

      for (const color of validColors) {
        const dto: CreateCategoryDto = {
          name: 'Test',
          color,
          userId: 'user-123',
        };

        const category = new Category('id', 'Test', color, 'user-123');
        mockCategoryRepository.create.mockResolvedValue(category);

        await expect(useCase.execute(dto)).resolves.toEqual(category);
      }
    });

    it('should propagate ConflictError from repository when category name already exists', async () => {
      const conflictError = new ConflictError('Category name already exists for this user');
      mockCategoryRepository.create.mockRejectedValue(conflictError);

      await expect(useCase.execute(validDto)).rejects.toThrow(ConflictError);
      await expect(useCase.execute(validDto)).rejects.toThrow('Category name already exists for this user');
      expect(mockCategoryRepository.create).toHaveBeenCalledWith(validDto);
    });

    it('should propagate other repository errors', async () => {
      const dbError = new Error('Database connection failed');
      mockCategoryRepository.create.mockRejectedValue(dbError);

      await expect(useCase.execute(validDto)).rejects.toThrow('Database connection failed');
      expect(mockCategoryRepository.create).toHaveBeenCalledWith(validDto);
    });
  });
});
