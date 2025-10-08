import { Tag } from '../../../domain/entities/tag';
import { TagRepository } from '../../../domain/repositories/tag.repository';
import { CreateTagDto } from '../../../domain/repositories/types';
import { ConflictError, ValidationError } from '../../../shared/errors';
import { CreateTagUseCase } from '../create-tag.use-case';

describe('CreateTagUseCase', () => {
  let useCase: CreateTagUseCase;
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

    useCase = new CreateTagUseCase(mockTagRepository);
  });

  describe('execute', () => {
    const validDto: CreateTagDto = {
      name: 'Work',
      userId: 'user-123'
    };

    const mockTag = new Tag('tag-123', 'Work', 'user-123');

    it('should create tag successfully with valid data', async () => {
      mockTagRepository.existsByNameForUser.mockResolvedValue(false);
      mockTagRepository.create.mockResolvedValue(mockTag);

      const result = await useCase.execute(validDto);

      expect(mockTagRepository.existsByNameForUser).toHaveBeenCalledWith('user-123', 'Work');
      expect(mockTagRepository.create).toHaveBeenCalledWith(validDto);
      expect(result).toBe(mockTag);
    });

    it('should trim whitespace from tag name', async () => {
      const dtoWithWhitespace: CreateTagDto = {
        name: '  Work  ',
        userId: 'user-123'
      };

      mockTagRepository.existsByNameForUser.mockResolvedValue(false);
      mockTagRepository.create.mockResolvedValue(mockTag);

      await useCase.execute(dtoWithWhitespace);

      expect(mockTagRepository.existsByNameForUser).toHaveBeenCalledWith('user-123', 'Work');
      expect(mockTagRepository.create).toHaveBeenCalledWith({
        name: 'Work',
        userId: 'user-123'
      });
    });

    it('should throw ConflictError when tag name already exists for user', async () => {
      mockTagRepository.existsByNameForUser.mockResolvedValue(true);

      await expect(useCase.execute(validDto)).rejects.toThrow(ConflictError);
      await expect(useCase.execute(validDto)).rejects.toThrow("Tag with name 'Work' already exists for this user");

      expect(mockTagRepository.existsByNameForUser).toHaveBeenCalledWith('user-123', 'Work');
      expect(mockTagRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when tag name is empty', async () => {
      const invalidDto: CreateTagDto = {
        name: '',
        userId: 'user-123'
      };

      await expect(useCase.execute(invalidDto)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(invalidDto)).rejects.toThrow('Tag name is required');

      expect(mockTagRepository.existsByNameForUser).not.toHaveBeenCalled();
      expect(mockTagRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when tag name is only whitespace', async () => {
      const invalidDto: CreateTagDto = {
        name: '   ',
        userId: 'user-123'
      };

      await expect(useCase.execute(invalidDto)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(invalidDto)).rejects.toThrow('Tag name is required');
    });

    it('should throw ValidationError when tag name exceeds 100 characters', async () => {
      const invalidDto: CreateTagDto = {
        name: 'a'.repeat(101),
        userId: 'user-123'
      };

      await expect(useCase.execute(invalidDto)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(invalidDto)).rejects.toThrow('Tag name cannot exceed 100 characters');
    });

    it('should throw ValidationError when user ID is empty', async () => {
      const invalidDto: CreateTagDto = {
        name: 'Work',
        userId: ''
      };

      await expect(useCase.execute(invalidDto)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(invalidDto)).rejects.toThrow('User ID is required');
    });

    it('should throw ValidationError when user ID is only whitespace', async () => {
      const invalidDto: CreateTagDto = {
        name: 'Work',
        userId: '   '
      };

      await expect(useCase.execute(invalidDto)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(invalidDto)).rejects.toThrow('User ID is required');
    });

    it('should handle repository errors', async () => {
      mockTagRepository.existsByNameForUser.mockResolvedValue(false);
      mockTagRepository.create.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(validDto)).rejects.toThrow('Database error');

      expect(mockTagRepository.existsByNameForUser).toHaveBeenCalledWith('user-123', 'Work');
      expect(mockTagRepository.create).toHaveBeenCalledWith(validDto);
    });
  });
});
