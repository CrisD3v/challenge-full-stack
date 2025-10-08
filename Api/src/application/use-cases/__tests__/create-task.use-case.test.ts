import { Task } from '../../../domain/entities/task';
import { TaskRepository } from '../../../domain/repositories/task.repository';
import { Priority } from '../../../domain/value-objects/priority';
import { ValidationError } from '../../../shared/errors/validation.error';
import { CreateTaskUseCase } from '../create-task.use-case';

describe('CreateTaskUseCase', () => {
  let useCase: CreateTaskUseCase;
  let mockTaskRepository: jest.Mocked<TaskRepository>;

  beforeEach(() => {
    mockTaskRepository = {
      create: jest.fn(),
      findByUserId: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      toggleComplete: jest.fn(),
      countByUserId: jest.fn()
    };

    useCase = new CreateTaskUseCase(mockTaskRepository);
  });

  describe('execute', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const validDto = {
      title: 'Test Task',
      description: 'Test description',
      priority: 'alta' as const,
      dueDate: '2024-12-31T23:59:59.000Z',
      categoryId: 'cat-123'
    };

    it('should create a task successfully with all fields', async () => {
      // Arrange
      const createdTask = new Task(
        'task-123',
        validDto.title,
        validDto.description,
        false,
        new Priority('alta'),
        new Date(validDto.dueDate),
        userId,
        validDto.categoryId,
        new Date(),
        new Date()
      );

      mockTaskRepository.create.mockResolvedValue(createdTask);

      // Act
      const result = await useCase.execute(validDto, userId);

      // Assert
      expect(mockTaskRepository.create).toHaveBeenCalledWith({
        title: validDto.title,
        description: validDto.description,
        priority: validDto.priority,
        dueDate: new Date(validDto.dueDate),
        userId: userId,
        categoryId: validDto.categoryId
      });

      expect(result).toEqual({
        id: 'task-123',
        title: validDto.title,
        description: validDto.description,
        completed: false,
        priority: 'alta',
        dueDate: new Date(validDto.dueDate),
        userId: userId,
        categoryId: validDto.categoryId,
        createdAt: createdTask.createdAt,
        updatedAt: createdTask.updatedAt
      });
    });

    it('should create a task successfully with minimal fields', async () => {
      // Arrange
      const minimalDto = {
        title: 'Minimal Task'
      };

      const createdTask = new Task(
        'task-123',
        minimalDto.title,
        null,
        false,
        new Priority('media'),
        null,
        userId,
        null,
        new Date(),
        new Date()
      );

      mockTaskRepository.create.mockResolvedValue(createdTask);

      // Act
      const result = await useCase.execute(minimalDto, userId);

      // Assert
      expect(mockTaskRepository.create).toHaveBeenCalledWith({
        title: minimalDto.title,
        description: null,
        priority: 'media',
        dueDate: null,
        userId: userId,
        categoryId: null
      });

      expect(result.title).toBe(minimalDto.title);
      expect(result.description).toBeNull();
      expect(result.priority).toBe('media');
      expect(result.dueDate).toBeNull();
      expect(result.categoryId).toBeNull();
    });

    it('should throw ValidationError when title is empty', async () => {
      // Arrange
      const invalidDto = { ...validDto, title: '' };

      // Act & Assert
      await expect(useCase.execute(invalidDto, userId)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(invalidDto, userId)).rejects.toThrow('Task title is required');
      expect(mockTaskRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when title is only whitespace', async () => {
      // Arrange
      const invalidDto = { ...validDto, title: '   ' };

      // Act & Assert
      await expect(useCase.execute(invalidDto, userId)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(invalidDto, userId)).rejects.toThrow('Task title is required');
    });

    it('should throw ValidationError when title exceeds 255 characters', async () => {
      // Arrange
      const longTitle = 'a'.repeat(256);
      const invalidDto = { ...validDto, title: longTitle };

      // Act & Assert
      await expect(useCase.execute(invalidDto, userId)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(invalidDto, userId)).rejects.toThrow('Task title cannot exceed 255 characters');
    });

    it('should throw ValidationError when description exceeds 1000 characters', async () => {
      // Arrange
      const longDescription = 'a'.repeat(1001);
      const invalidDto = { ...validDto, description: longDescription };

      // Act & Assert
      await expect(useCase.execute(invalidDto, userId)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(invalidDto, userId)).rejects.toThrow('Task description cannot exceed 1000 characters');
    });

    it('should throw ValidationError when priority is invalid', async () => {
      // Arrange
      const invalidDto = { ...validDto, priority: 'invalid' as any };

      // Act & Assert
      await expect(useCase.execute(invalidDto, userId)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(invalidDto, userId)).rejects.toThrow('Priority must be baja, media, or alta');
    });

    it('should throw ValidationError when dueDate is invalid date', async () => {
      // Arrange
      const invalidDto = { ...validDto, dueDate: 'invalid-date' };

      // Act & Assert
      await expect(useCase.execute(invalidDto, userId)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(invalidDto, userId)).rejects.toThrow('Invalid due date format');
    });

    it('should handle empty description correctly', async () => {
      // Arrange
      const dtoWithEmptyDescription = { ...validDto, description: '' };

      const createdTask = new Task(
        'task-123',
        validDto.title,
        null,
        false,
        new Priority('alta'),
        new Date(validDto.dueDate),
        userId,
        validDto.categoryId,
        new Date(),
        new Date()
      );

      mockTaskRepository.create.mockResolvedValue(createdTask);

      // Act
      await useCase.execute(dtoWithEmptyDescription, userId);

      // Assert
      expect(mockTaskRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: null
        })
      );
    });

    it('should trim title and description', async () => {
      // Arrange
      const dtoWithWhitespace = {
        title: '  Test Task  ',
        description: '  Test description  '
      };

      const createdTask = new Task(
        'task-123',
        'Test Task',
        'Test description',
        false,
        new Priority('media'),
        null,
        userId,
        null,
        new Date(),
        new Date()
      );

      mockTaskRepository.create.mockResolvedValue(createdTask);

      // Act
      await useCase.execute(dtoWithWhitespace, userId);

      // Assert
      expect(mockTaskRepository.create).toHaveBeenCalledWith({
        title: 'Test Task',
        description: 'Test description',
        priority: 'media',
        dueDate: null,
        userId: userId,
        categoryId: null
      });
    });

    it('should handle repository errors', async () => {
      // Arrange
      mockTaskRepository.create.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(useCase.execute(validDto, userId)).rejects.toThrow('Database error');
    });
  });
});
