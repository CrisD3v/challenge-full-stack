import { Task } from '../../../domain/entities/task';
import { TaskRepository } from '../../../domain/repositories/task.repository';
import { Priority } from '../../../domain/value-objects/priority';
import { ForbiddenError } from '../../../shared/errors/forbidden.error';
import { NotFoundError } from '../../../shared/errors/not-found.error';
import { ValidationError } from '../../../shared/errors/validation.error';
import { UpdateTaskUseCase } from '../update-task.use-case';

describe('UpdateTaskUseCase', () => {
  let useCase: UpdateTaskUseCase;
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

    useCase = new UpdateTaskUseCase(mockTaskRepository);
  });

  describe('execute', () => {
    const taskId = 'task-123';
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const otherUserId = '987e6543-e21c-34b5-a654-321987654321';

    const existingTask = new Task(
      taskId,
      'Original Task',
      'Original description',
      false,
      new Priority('media'),
      new Date('2024-12-31'),
      userId,
      'cat-1',
      new Date('2024-01-01'),
      new Date('2024-01-01')
    );

    const updateDto = {
      title: 'Updated Task',
      description: 'Updated description',
      priority: 'alta' as const,
      dueDate: '2024-12-25T23:59:59.000Z',
      categoryId: 'cat-2'
    };

    it('should update task successfully with all fields', async () => {
      // Arrange
      const updatedTask = new Task(
        taskId,
        updateDto.title,
        updateDto.description,
        false,
        new Priority('alta'),
        new Date(updateDto.dueDate),
        userId,
        updateDto.categoryId,
        existingTask.createdAt,
        new Date()
      );

      mockTaskRepository.findById.mockResolvedValue(existingTask);
      mockTaskRepository.update.mockResolvedValue(updatedTask);

      // Act
      const result = await useCase.execute(taskId, updateDto, userId);

      // Assert
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.update).toHaveBeenCalledWith(taskId, {
        title: updateDto.title,
        description: updateDto.description,
        priority: updateDto.priority,
        dueDate: new Date(updateDto.dueDate),
        categoryId: updateDto.categoryId
      });

      expect(result).toEqual({
        id: taskId,
        title: updateDto.title,
        description: updateDto.description,
        completed: false,
        priority: 'alta',
        dueDate: new Date(updateDto.dueDate),
        userId: userId,
        categoryId: updateDto.categoryId,
        createdAt: updatedTask.createdAt,
        updatedAt: updatedTask.updatedAt
      });
    });

    it('should update task successfully with partial fields', async () => {
      // Arrange
      const partialUpdateDto = {
        title: 'Updated Title Only'
      };

      const updatedTask = new Task(
        taskId,
        partialUpdateDto.title,
        existingTask.description,
        existingTask.completed,
        existingTask.priority,
        existingTask.dueDate,
        userId,
        existingTask.categoryId,
        existingTask.createdAt,
        new Date()
      );

      mockTaskRepository.findById.mockResolvedValue(existingTask);
      mockTaskRepository.update.mockResolvedValue(updatedTask);

      // Act
      const result = await useCase.execute(taskId, partialUpdateDto, userId);

      // Assert
      expect(mockTaskRepository.update).toHaveBeenCalledWith(taskId, {
        title: partialUpdateDto.title
      });

      expect(result.title).toBe(partialUpdateDto.title);
    });

    it('should throw NotFoundError when task does not exist', async () => {
      // Arrange
      mockTaskRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(taskId, updateDto, userId)).rejects.toThrow(NotFoundError);
      await expect(useCase.execute(taskId, updateDto, userId)).rejects.toThrow('Task not found');
      expect(mockTaskRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError when user does not own the task', async () => {
      // Arrange
      mockTaskRepository.findById.mockResolvedValue(existingTask);

      // Act & Assert
      await expect(useCase.execute(taskId, updateDto, otherUserId)).rejects.toThrow(ForbiddenError);
      await expect(useCase.execute(taskId, updateDto, otherUserId)).rejects.toThrow('You can only update your own tasks');
      expect(mockTaskRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when title is empty', async () => {
      // Arrange
      const invalidDto = { title: '' };
      mockTaskRepository.findById.mockResolvedValue(existingTask);

      // Act & Assert
      await expect(useCase.execute(taskId, invalidDto, userId)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(taskId, invalidDto, userId)).rejects.toThrow('Task title cannot be empty');
    });

    it('should throw ValidationError when title is only whitespace', async () => {
      // Arrange
      const invalidDto = { title: '   ' };
      mockTaskRepository.findById.mockResolvedValue(existingTask);

      // Act & Assert
      await expect(useCase.execute(taskId, invalidDto, userId)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(taskId, invalidDto, userId)).rejects.toThrow('Task title cannot be empty');
    });

    it('should throw ValidationError when title exceeds 255 characters', async () => {
      // Arrange
      const longTitle = 'a'.repeat(256);
      const invalidDto = { title: longTitle };
      mockTaskRepository.findById.mockResolvedValue(existingTask);

      // Act & Assert
      await expect(useCase.execute(taskId, invalidDto, userId)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(taskId, invalidDto, userId)).rejects.toThrow('Task title cannot exceed 255 characters');
    });

    it('should throw ValidationError when description exceeds 1000 characters', async () => {
      // Arrange
      const longDescription = 'a'.repeat(1001);
      const invalidDto = { description: longDescription };
      mockTaskRepository.findById.mockResolvedValue(existingTask);

      // Act & Assert
      await expect(useCase.execute(taskId, invalidDto, userId)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(taskId, invalidDto, userId)).rejects.toThrow('Task description cannot exceed 1000 characters');
    });

    it('should throw ValidationError when priority is invalid', async () => {
      // Arrange
      const invalidDto = { priority: 'invalid' as any };
      mockTaskRepository.findById.mockResolvedValue(existingTask);

      // Act & Assert
      await expect(useCase.execute(taskId, invalidDto, userId)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(taskId, invalidDto, userId)).rejects.toThrow('Priority must be baja, media, or alta');
    });

    it('should throw ValidationError when dueDate is invalid date', async () => {
      // Arrange
      const invalidDto = { dueDate: 'invalid-date' };
      mockTaskRepository.findById.mockResolvedValue(existingTask);

      // Act & Assert
      await expect(useCase.execute(taskId, invalidDto, userId)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(taskId, invalidDto, userId)).rejects.toThrow('Invalid due date format');
    });

    it('should handle null values correctly', async () => {
      // Arrange
      const nullDto = {
        description: null,
        dueDate: null,
        categoryId: null
      };

      const updatedTask = new Task(
        taskId,
        existingTask.title,
        null,
        existingTask.completed,
        existingTask.priority,
        null,
        userId,
        null,
        existingTask.createdAt,
        new Date()
      );

      mockTaskRepository.findById.mockResolvedValue(existingTask);
      mockTaskRepository.update.mockResolvedValue(updatedTask);

      // Act
      await useCase.execute(taskId, nullDto, userId);

      // Assert
      expect(mockTaskRepository.update).toHaveBeenCalledWith(taskId, {
        description: null,
        dueDate: null,
        categoryId: null
      });
    });

    it('should trim title and description', async () => {
      // Arrange
      const dtoWithWhitespace = {
        title: '  Updated Task  ',
        description: '  Updated description  '
      };

      const updatedTask = new Task(
        taskId,
        'Updated Task',
        'Updated description',
        existingTask.completed,
        existingTask.priority,
        existingTask.dueDate,
        userId,
        existingTask.categoryId,
        existingTask.createdAt,
        new Date()
      );

      mockTaskRepository.findById.mockResolvedValue(existingTask);
      mockTaskRepository.update.mockResolvedValue(updatedTask);

      // Act
      await useCase.execute(taskId, dtoWithWhitespace, userId);

      // Assert
      expect(mockTaskRepository.update).toHaveBeenCalledWith(taskId, {
        title: 'Updated Task',
        description: 'Updated description'
      });
    });

    it('should handle empty description correctly', async () => {
      // Arrange
      const dtoWithEmptyDescription = { description: '' };

      const updatedTask = new Task(
        taskId,
        existingTask.title,
        null,
        existingTask.completed,
        existingTask.priority,
        existingTask.dueDate,
        userId,
        existingTask.categoryId,
        existingTask.createdAt,
        new Date()
      );

      mockTaskRepository.findById.mockResolvedValue(existingTask);
      mockTaskRepository.update.mockResolvedValue(updatedTask);

      // Act
      await useCase.execute(taskId, dtoWithEmptyDescription, userId);

      // Assert
      expect(mockTaskRepository.update).toHaveBeenCalledWith(taskId, {
        description: null
      });
    });

    it('should handle repository errors', async () => {
      // Arrange
      mockTaskRepository.findById.mockResolvedValue(existingTask);
      mockTaskRepository.update.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(useCase.execute(taskId, updateDto, userId)).rejects.toThrow('Database error');
    });
  });
});
