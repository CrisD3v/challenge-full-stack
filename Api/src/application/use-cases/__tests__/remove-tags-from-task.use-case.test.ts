import { Tag } from '../../../domain/entities/tag';
import { Task } from '../../../domain/entities/task';
import { TagRepository } from '../../../domain/repositories/tag.repository';
import { TaskRepository } from '../../../domain/repositories/task.repository';
import { Priority } from '../../../domain/value-objects/priority';
import { ForbiddenError, NotFoundError, ValidationError } from '../../../shared/errors';
import { RemoveTagsFromTaskDto, RemoveTagsFromTaskUseCase } from '../remove-tags-from-task.use-case';

describe('RemoveTagsFromTaskUseCase', () => {
  let useCase: RemoveTagsFromTaskUseCase;
  let mockTagRepository: jest.Mocked<TagRepository>;
  let mockTaskRepository: jest.Mocked<TaskRepository>;

  beforeEach(() => {
    mockTagRepository = {
      create: jest.fn(),
      findByUserId: jest.fn(),
      findById: jest.fn(),
      findByIds: jest.fn(),
      addToTask: jest.fn(),
      removeFromTask: jest.fn(),
      findByTaskId: jest.fn(),
      existsByNameForUser: jest.fn(),
      removeAllFromTask: jest.fn(),
    };

    mockTaskRepository = {
      create: jest.fn(),
      findByUserId: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      toggleComplete: jest.fn(),
      countByUserId: jest.fn(),
    };

    useCase = new RemoveTagsFromTaskUseCase(mockTagRepository, mockTaskRepository);
  });

  describe('execute', () => {
    const userId = 'user-123';
    const taskId = 'task-123';
    const tagIds = ['tag-1', 'tag-2'];

    const validDto: RemoveTagsFromTaskDto = {
      taskId,
      tagIds,
      userId
    };

    const mockTask = new Task(
      taskId,
      'Test Task',
      'Description',
      false,
      new Priority('media'),
      null,
      userId,
      null,
      new Date(),
      new Date()
    );

    const mockTags = [
      new Tag('tag-1', 'Work', userId),
      new Tag('tag-2', 'Urgent', userId)
    ];

    it('should remove tags from task successfully', async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTagRepository.findByIds.mockResolvedValue(mockTags);

      await useCase.execute(validDto);

      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTagRepository.findByIds).toHaveBeenCalledWith(tagIds);
      expect(mockTagRepository.removeFromTask).toHaveBeenCalledWith(taskId, tagIds);
      expect(mockTagRepository.removeAllFromTask).not.toHaveBeenCalled();
    });

    it('should remove all tags when empty tag IDs array is provided', async () => {
      const dtoWithEmptyTags: RemoveTagsFromTaskDto = {
        ...validDto,
        tagIds: []
      };

      mockTaskRepository.findById.mockResolvedValue(mockTask);

      await useCase.execute(dtoWithEmptyTags);

      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTagRepository.findByIds).not.toHaveBeenCalled();
      expect(mockTagRepository.removeFromTask).not.toHaveBeenCalled();
      expect(mockTagRepository.removeAllFromTask).toHaveBeenCalledWith(taskId);
    });

    it('should remove duplicate tag IDs', async () => {
      const dtoWithDuplicates: RemoveTagsFromTaskDto = {
        ...validDto,
        tagIds: ['tag-1', 'tag-2', 'tag-1', 'tag-2']
      };

      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTagRepository.findByIds.mockResolvedValue(mockTags);

      await useCase.execute(dtoWithDuplicates);

      expect(mockTagRepository.findByIds).toHaveBeenCalledWith(['tag-1', 'tag-2']);
      expect(mockTagRepository.removeFromTask).toHaveBeenCalledWith(taskId, ['tag-1', 'tag-2']);
    });

    it('should filter out empty tag IDs', async () => {
      const dtoWithEmptyIds: RemoveTagsFromTaskDto = {
        ...validDto,
        tagIds: ['tag-1', '', 'tag-2', '   ', 'tag-3']
      };

      const filteredTags = [
        new Tag('tag-1', 'Work', userId),
        new Tag('tag-2', 'Urgent', userId),
        new Tag('tag-3', 'Personal', userId)
      ];

      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTagRepository.findByIds.mockResolvedValue(filteredTags);

      await useCase.execute(dtoWithEmptyIds);

      expect(mockTagRepository.findByIds).toHaveBeenCalledWith(['tag-1', 'tag-2', 'tag-3']);
      expect(mockTagRepository.removeFromTask).toHaveBeenCalledWith(taskId, ['tag-1', 'tag-2', 'tag-3']);
    });

    it('should only remove existing tags', async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTagRepository.findByIds.mockResolvedValue([mockTags[0]!]); // Only one tag exists

      await useCase.execute(validDto);

      expect(mockTagRepository.findByIds).toHaveBeenCalledWith(tagIds);
      expect(mockTagRepository.removeFromTask).toHaveBeenCalledWith(taskId, ['tag-1']);
    });

    it('should not call removeFromTask when no tags exist', async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTagRepository.findByIds.mockResolvedValue([]); // No tags found

      await useCase.execute(validDto);

      expect(mockTagRepository.findByIds).toHaveBeenCalledWith(tagIds);
      expect(mockTagRepository.removeFromTask).not.toHaveBeenCalled();
      expect(mockTagRepository.removeAllFromTask).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when task does not exist', async () => {
      mockTaskRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(validDto)).rejects.toThrow(NotFoundError);
      await expect(useCase.execute(validDto)).rejects.toThrow('Task not found');

      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTagRepository.findByIds).not.toHaveBeenCalled();
      expect(mockTagRepository.removeFromTask).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError when task does not belong to user', async () => {
      const otherUserTask = new Task(
        taskId,
        'Test Task',
        'Description',
        false,
        new Priority('media'),
        null,
        'other-user',
        null,
        new Date(),
        new Date()
      );

      mockTaskRepository.findById.mockResolvedValue(otherUserTask);

      await expect(useCase.execute(validDto)).rejects.toThrow(ForbiddenError);
      await expect(useCase.execute(validDto)).rejects.toThrow('You can only remove tags from your own tasks');

      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTagRepository.findByIds).not.toHaveBeenCalled();
      expect(mockTagRepository.removeFromTask).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when task ID is empty', async () => {
      const invalidDto: RemoveTagsFromTaskDto = {
        ...validDto,
        taskId: ''
      };

      await expect(useCase.execute(invalidDto)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(invalidDto)).rejects.toThrow('Task ID is required');
    });

    it('should throw ValidationError when user ID is empty', async () => {
      const invalidDto: RemoveTagsFromTaskDto = {
        ...validDto,
        userId: ''
      };

      await expect(useCase.execute(invalidDto)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(invalidDto)).rejects.toThrow('User ID is required');
    });

    it('should throw ValidationError when tag IDs is not an array', async () => {
      const invalidDto: any = {
        ...validDto,
        tagIds: 'not-an-array'
      };

      await expect(useCase.execute(invalidDto)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(invalidDto)).rejects.toThrow('Tag IDs must be an array');
    });

    it('should handle repository errors', async () => {
      mockTaskRepository.findById.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(validDto)).rejects.toThrow('Database error');
    });

    it('should handle null and undefined values gracefully', async () => {
      await expect(useCase.execute({
        taskId: null as any,
        tagIds: [],
        userId
      })).rejects.toThrow(ValidationError);

      await expect(useCase.execute({
        taskId,
        tagIds: null as any,
        userId
      })).rejects.toThrow(ValidationError);

      await expect(useCase.execute({
        taskId,
        tagIds: [],
        userId: undefined as any
      })).rejects.toThrow(ValidationError);
    });
  });
});
