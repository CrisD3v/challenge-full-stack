import { Category } from '../../domain/entities/category';
import { CategoryRepository } from '../../domain/repositories/category.repository';
import { UpdateCategoryDto } from '../../domain/repositories/types';
import { logger } from '../../infrastructure/logging/logger';
import { NotFoundError } from '../../shared/errors/not-found.error';
import { UnauthorizedError } from '../../shared/errors/unauthorized.error';
import { ValidationError } from '../../shared/errors/validation.error';

export class UpdateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) { }

  async execute(categoryId: string, userId: string, updates: UpdateCategoryDto): Promise<Category> {
    logger.info('Updating category', { categoryId, userId });

    // Validate input
    this.validateInput(categoryId, userId, updates);

    try {
      // First, verify the category exists and belongs to the user
      const existingCategory = await this.categoryRepository.findById(categoryId);

      if (!existingCategory) {
        throw new NotFoundError('Category not found');
      }

      // Verify ownership
      if (!existingCategory.belongsToUser(userId)) {
        throw new UnauthorizedError('You can only update your own categories');
      }

      // Update the category
      const updatedCategory = await this.categoryRepository.update(categoryId, updates);

      logger.info('Category updated successfully', {
        categoryId,
        userId,
        updates
      });

      return updatedCategory;
    } catch (error) {
      logger.error('Failed to update category', {
        error,
        categoryId,
        userId,
        updates
      });
      throw error;
    }
  }

  private validateInput(categoryId: string, userId: string, updates: UpdateCategoryDto): void {
    if (!categoryId || categoryId.trim().length === 0) {
      throw new ValidationError('Category ID is required', 'categoryId');
    }

    if (!userId || userId.trim().length === 0) {
      throw new ValidationError('User ID is required', 'userId');
    }

    // Validate updates if provided
    if (updates.name !== undefined) {
      if (updates.name === null || updates.name.trim().length === 0) {
        throw new ValidationError('Category name cannot be empty', 'name');
      }

      if (updates.name.length > 255) {
        throw new ValidationError('Category name cannot exceed 255 characters', 'name');
      }
    }

    if (updates.color !== undefined && updates.color !== null) {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      if (!hexColorRegex.test(updates.color)) {
        throw new ValidationError('Color must be a valid hex color code (e.g., #FF0000)', 'color');
      }
    }

    // Ensure at least one field is being updated
    if (Object.keys(updates).length === 0) {
      throw new ValidationError('At least one field must be provided for update', 'updates');
    }
  }
}
