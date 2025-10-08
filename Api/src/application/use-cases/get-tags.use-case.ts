import { Tag } from '../../domain/entities/tag';
import { TagRepository } from '../../domain/repositories/tag.repository';
import { ValidationError } from '../../shared/errors';

export class GetTagsUseCase {
  constructor(private readonly tagRepository: TagRepository) { }

  async execute(userId: string): Promise<Tag[]> {
    // Validate input
    this.validateInput(userId);

    // Retrieve all tags for the user
    return await this.tagRepository.findByUserId(userId);
  }

  private validateInput(userId: string): void {
    if (!userId || userId.trim().length === 0) {
      throw new ValidationError('User ID is required', 'userId');
    }
  }
}
