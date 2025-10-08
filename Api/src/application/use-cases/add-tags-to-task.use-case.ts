import { TagRepository } from '../../domain/repositories/tag.repository';
import { TaskRepository } from '../../domain/repositories/task.repository';
import { ForbiddenError, NotFoundError, ValidationError } from '../../shared/errors';

export interface AddTagsToTaskDto {
  taskId: string;
  tagIds: string[];
  userId: string;
}

export class AddTagsToTaskUseCase {
  constructor(
    private readonly tagRepository: TagRepository,
    private readonly taskRepository: TaskRepository
  ) { }

  async execute(dto: AddTagsToTaskDto): Promise<void> {
    // Validate input
    this.validateInput(dto);

    // Verify task exists and belongs to user
    const task = await this.taskRepository.findById(dto.taskId);
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    if (!task.belongsToUser(dto.userId)) {
      throw new ForbiddenError('You can only add tags to your own tasks');
    }

    // Verify all tags exist and belong to user
    if (dto.tagIds.length > 0) {
      const tags = await this.tagRepository.findByIds(dto.tagIds);

      if (tags.length !== dto.tagIds.length) {
        throw new NotFoundError('One or more tags not found');
      }

      // Check that all tags belong to the user
      const invalidTags = tags.filter(tag => !tag.belongsToUser(dto.userId));
      if (invalidTags.length > 0) {
        throw new ForbiddenError('You can only add your own tags to tasks');
      }
    }

    // Add tags to task
    await this.tagRepository.addToTask(dto.taskId, dto.tagIds);
  }

  private validateInput(dto: AddTagsToTaskDto): void {
    if (!dto.taskId || dto.taskId.trim().length === 0) {
      throw new ValidationError('Task ID is required', 'taskId');
    }

    if (!dto.userId || dto.userId.trim().length === 0) {
      throw new ValidationError('User ID is required', 'userId');
    }

    if (!Array.isArray(dto.tagIds)) {
      throw new ValidationError('Tag IDs must be an array', 'tagIds');
    }

    // Remove duplicates and empty strings
    dto.tagIds = [...new Set(dto.tagIds.filter(id => id && id.trim().length > 0))];
  }
}
