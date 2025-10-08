import { CategoryRepository } from '../../domain/repositories/category.repository';
import { logger } from '../../infrastructure/logging/logger';
import { NotFoundError } from '../../shared/errors/not-found.error';
import { UnauthorizedError } from '../../shared/errors/unauthorized.error';
import { ValidationError } from '../../shared/errors/validation.error';

export class DeleteCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) { }

  async execute(categoryId: string, userId: string): Promise<void> {
    logger.info('Deleting category', { categoryId, userId });

    // Validate input
    this.validateInput(categoryId, userId);

    try {
      // First, verify the category exists and belongs to the user
      const existingCategory = await this.categoryRepository.findById(categoryId);

      if (!existingCategory) {
        throw new NotFoundError('Category not found');
      }

      // Verify ownership
      if (!existingCategory.belongsToUser(userId)) {
        throw new UnauthorizedError('You can only delete your own categories');
      }

      // Delete the category (repository handles task relationship cleanup)
      await this.categoryRepository.delete(categoryId);

      logger.info('Category deleted successfully', {
        categoryId,
        userId,
        categoryName: existingCategory.name
      });
    } catch (error) {
      logger.error('Failed to delete category', {
        error,
        categoryId,
        userId
      });
      throw error;
    }
  }

  private validateInput(categoryId: string, userId: string): void {
    if (!categoryId || categoryId.trim().length === 0) {
      throw new ValidationError('Category ID is required', 'categoryId');
    }

    if (!userId || userId.trim().length === 0) {
      throw new ValidationError('User ID is required', 'userId');
    }
  }
}
