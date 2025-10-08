import { Category } from '../../domain/entities/category';
import { CategoryRepository } from '../../domain/repositories/category.repository';
import { CreateCategoryDto } from '../../domain/repositories/types';
import { logger } from '../../infrastructure/logging/logger';
import { ValidationError } from '../../shared/errors/validation.error';

export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) { }

  async execute(dto: CreateCategoryDto): Promise<Category> {
    logger.info('Creating category', { userId: dto.userId, name: dto.name });

    // Validate input
    this.validateInput(dto);

    try {
      // Check if category name already exists for this user (handled by repository)
      const category = await this.categoryRepository.create(dto);

      logger.info('Category created successfully', {
        categoryId: category.id,
        userId: dto.userId,
        name: dto.name
      });

      return category;
    } catch (error) {
      logger.error('Failed to create category', {
        error,
        userId: dto.userId,
        name: dto.name
      });
      throw error;
    }
  }

  private validateInput(dto: CreateCategoryDto): void {
    if (!dto.name || dto.name.trim().length === 0) {
      throw new ValidationError('Category name is required', 'name');
    }

    if (dto.name.length > 255) {
      throw new ValidationError('Category name cannot exceed 255 characters', 'name');
    }

    if (!dto.userId || dto.userId.trim().length === 0) {
      throw new ValidationError('User ID is required', 'userId');
    }

    if (dto.color !== undefined && dto.color !== null) {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      if (!hexColorRegex.test(dto.color)) {
        throw new ValidationError('Color must be a valid hex color code (e.g., #FF0000)', 'color');
      }
    }
  }
}
