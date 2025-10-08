import { TagRepository } from '../../domain/repositories/tag.repository';
import { TaskRepository } from '../../domain/repositories/task.repository';
import { ForbiddenError, NotFoundError, ValidationError } from '../../shared/errors';

export interface RemoveTagsFromTaskDto {
  taskId: string;
  tagIds: string[];
  userId: string;
}

export class RemoveTagsFromTaskUseCase {
  constructor(
    private readonly tagRepository: TagRepository,
    private readonly taskRepository: TaskRepository
  ) { }

  async execute(dto: RemoveTagsFromTaskDto): Promise<void> {
    // Validate input
    this.validateInput(dto);

    // Verify task exists and belongs to user
    const task = await this.taskRepository.findById(dto.taskId);
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    if (!task.belongsToUser(dto.userId)) {
      throw new ForbiddenError('You can only remove tags from your own tasks');
    }

    // If no tag IDs provided, remove all tags from task
    if (dto.tagIds.length === 0) {
      await this.tagRepository.removeAllFromTask(dto.taskId);
      return;
    }

    // Verify tags exist (we don't need to check ownership for removal)
    const tags = await this.tagRepository.findByIds(dto.tagIds);
    const existingTagIds = tags.map(tag => tag.id);

    // Only remove tags that actually exist
    if (existingTagIds.length > 0) {
      await this.tagRepository.removeFromTask(dto.taskId, existingTagIds);
    }
  }

  private validateInput(dto: RemoveTagsFromTaskDto): void {
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
