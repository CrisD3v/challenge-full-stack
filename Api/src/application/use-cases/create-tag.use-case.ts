import { Tag } from '../../domain/entities/tag';
import { TagRepository } from '../../domain/repositories/tag.repository';
import { CreateTagDto } from '../../domain/repositories/types';
import { ConflictError, ValidationError } from '../../shared/errors';

export class CreateTagUseCase {
  constructor(private readonly tagRepository: TagRepository) { }

  async execute(dto: CreateTagDto): Promise<Tag> {
    // Validate input
    this.validateInput(dto);

    // Check if tag name already exists for this user
    const existingTag = await this.tagRepository.existsByNameForUser(dto.userId, dto.name);
    if (existingTag) {
      throw new ConflictError(`Tag with name '${dto.name}' already exists for this user`);
    }

    // Create the tag
    return await this.tagRepository.create(dto);
  }

  private validateInput(dto: CreateTagDto): void {
    if (!dto.name || dto.name.trim().length === 0) {
      throw new ValidationError('Tag name is required', 'name');
    }

    if (dto.name.length > 100) {
      throw new ValidationError('Tag name cannot exceed 100 characters', 'name');
    }

    if (!dto.userId || dto.userId.trim().length === 0) {
      throw new ValidationError('User ID is required', 'userId');
    }

    // Normalize the tag name (trim whitespace)
    dto.name = dto.name.trim();
  }
}
