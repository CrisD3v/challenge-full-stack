import { Category } from '../../domain/entities/category';
import { CategoryRepository } from '../../domain/repositories/category.repository';
import { logger } from '../../infrastructure/logging/logger';
import { ValidationError } from '../../shared/errors/validation.error';

export class GetCategoriesUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) { }

  async execute(userId: string): Promise<Category[]> {
    logger.info('Retrieving categories for user', { userId });

    // Validate input
    this.validateInput(userId);

    try {
      const categories = await this.categoryRepository.findByUserId(userId);

      logger.info('Categories retrieved successfully', {
        userId,
        count: categories.length
      });

      return categories;
    } catch (error) {
      logger.error('Failed to retrieve categories', { error, userId });
      throw error;
    }
  }

  private validateInput(userId: string): void {
    if (!userId || userId.trim().length === 0) {
      throw new ValidationError('User ID is required', 'userId');
    }
  }
}
