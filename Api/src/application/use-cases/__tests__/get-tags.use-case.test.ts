import { Tag } from '../../../domain/entities/tag';
import { TagRepository } from '../../../domain/repositories/tag.repository';
import { ValidationError } from '../../../shared/errors';
import { GetTagsUseCase } from '../get-tags.use-case';

describe('GetTagsUseCase', () => {
  let useCase: GetTagsUseCase;
  let mockTagRepository: jest.Mocked<TagRepository>;

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

    useCase = new GetTagsUseCase(mockTagRepository);
  });

  describe('execute', () => {
    const userId = 'user-123';
    const mockTags = [
      new Tag('tag-1', 'Work', userId),
      new Tag('tag-2', 'Personal', userId),
      new Tag('tag-3', 'Urgent', userId)
    ];

    it('should return all tags for a user', async () => {
      mockTagRepository.findByUserId.mockResolvedValue(mockTags);

      const result = await useCase.execute(userId);

      expect(mockTagRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockTags);
      expect(result).toHaveLength(3);
    });

    it('should return empty array when user has no tags', async () => {
      mockTagRepository.findByUserId.mockResolvedValue([]);

      const result = await useCase.execute(userId);

      expect(mockTagRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should throw ValidationError when user ID is empty', async () => {
      await expect(useCase.execute('')).rejects.toThrow(ValidationError);
      await expect(useCase.execute('')).rejects.toThrow('User ID is required');

      expect(mockTagRepository.findByUserId).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when user ID is only whitespace', async () => {
      await expect(useCase.execute('   ')).rejects.toThrow(ValidationError);
      await expect(useCase.execute('   ')).rejects.toThrow('User ID is required');

      expect(mockTagRepository.findByUserId).not.toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      mockTagRepository.findByUserId.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(userId)).rejects.toThrow('Database error');

      expect(mockTagRepository.findByUserId).toHaveBeenCalledWith(userId);
    });

    it('should handle null user ID', async () => {
      await expect(useCase.execute(null as any)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(null as any)).rejects.toThrow('User ID is required');
    });

    it('should handle undefined user ID', async () => {
      await expect(useCase.execute(undefined as any)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(undefined as any)).rejects.toThrow('User ID is required');
    });
  });
});
