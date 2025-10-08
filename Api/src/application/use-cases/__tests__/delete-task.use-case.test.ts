import { Task } from '../../../domain/entities/task';
import { TaskRepository } from '../../../domain/repositories/task.repository';
import { Priority } from '../../../domain/value-objects/priority';
import { ForbiddenError } from '../../../shared/errors/forbidden.error';
import { NotFoundError } from '../../../shared/errors/not-found.error';
import { DeleteTaskUseCase } from '../delete-task.use-case';

describe('DeleteTaskUseCase', () => {
  let useCase: DeleteTaskUseCase;
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

    useCase = new DeleteTaskUseCase(mockTaskRepository);
  });

  describe('execute', () => {
    const taskId = 'task-123';
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const otherUserId = '987e6543-e21c-34b5-a654-321987654321';

    const existingTask = new Task(
      taskId,
      'Test Task',
      'Test description',
      false,
      new Priority('media'),
      new Date('2024-12-31'),
      userId,
      'cat-1',
      new Date('2024-01-01'),
      new Date('2024-01-01')
    );

    it('should delete task successfully when user owns the task', async () => {
      // Arrange
      mockTaskRepository.findById.mockResolvedValue(existingTask);
      mockTaskRepository.delete.mockResolvedValue();

      // Act
      await useCase.execute(taskId, userId);

      // Assert
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.delete).toHaveBeenCalledWith(taskId);
    });

    it('should throw NotFoundError when task does not exist', async () => {
      // Arrange
      mockTaskRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(taskId, userId)).rejects.toThrow(NotFoundError);
      await expect(useCase.execute(taskId, userId)).rejects.toThrow('Task not found');
      expect(mockTaskRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError when user does not own the task', async () => {
      // Arrange
      mockTaskRepository.findById.mockResolvedValue(existingTask);

      // Act & Assert
      await expect(useCase.execute(taskId, otherUserId)).rejects.toThrow(ForbiddenError);
      await expect(useCase.execute(taskId, otherUserId)).rejects.toThrow('You can only delete your own tasks');
      expect(mockTaskRepository.delete).not.toHaveBeenCalled();
    });

    it('should handle repository findById errors', async () => {
      // Arrange
      mockTaskRepository.findById.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(useCase.execute(taskId, userId)).rejects.toThrow('Database error');
      expect(mockTaskRepository.delete).not.toHaveBeenCalled();
    });

    it('should handle repository delete errors', async () => {
      // Arrange
      mockTaskRepository.findById.mockResolvedValue(existingTask);
      mockTaskRepository.delete.mockRejectedValue(new Error('Delete error'));

      // Act & Assert
      await expect(useCase.execute(taskId, userId)).rejects.toThrow('Delete error');
    });

    it('should work with completed tasks', async () => {
      // Arrange
      const completedTask = new Task(
        taskId,
        'Completed Task',
        'Test description',
        true, // completed
        new Priority('media'),
        new Date('2024-12-31'),
        userId,
        'cat-1',
        new Date('2024-01-01'),
        new Date('2024-01-01')
      );

      mockTaskRepository.findById.mockResolvedValue(completedTask);
      mockTaskRepository.delete.mockResolvedValue();

      // Act
      await useCase.execute(taskId, userId);

      // Assert
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.delete).toHaveBeenCalledWith(taskId);
    });

    it('should work with tasks that have no category', async () => {
      // Arrange
      const taskWithoutCategory = new Task(
        taskId,
        'Task without category',
        'Test description',
        false,
        new Priority('media'),
        new Date('2024-12-31'),
        userId,
        null, // no category
        new Date('2024-01-01'),
        new Date('2024-01-01')
      );

      mockTaskRepository.findById.mockResolvedValue(taskWithoutCategory);
      mockTaskRepository.delete.mockResolvedValue();

      // Act
      await useCase.execute(taskId, userId);

      // Assert
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.delete).toHaveBeenCalledWith(taskId);
    });

    it('should work with tasks that have no due date', async () => {
      // Arrange
      const taskWithoutDueDate = new Task(
        taskId,
        'Task without due date',
        'Test description',
        false,
        new Priority('media'),
        null, // no due date
        userId,
        'cat-1',
        new Date('2024-01-01'),
        new Date('2024-01-01')
      );

      mockTaskRepository.findById.mockResolvedValue(taskWithoutDueDate);
      mockTaskRepository.delete.mockResolvedValue();

      // Act
      await useCase.execute(taskId, userId);

      // Assert
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.delete).toHaveBeenCalledWith(taskId);
    });
  });
});
