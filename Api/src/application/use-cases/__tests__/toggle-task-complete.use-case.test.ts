import { Task } from '../../../domain/entities/task';
import { TaskRepository } from '../../../domain/repositories/task.repository';
import { Priority } from '../../../domain/value-objects/priority';
import { ForbiddenError } from '../../../shared/errors/forbidden.error';
import { NotFoundError } from '../../../shared/errors/not-found.error';
import { ToggleTaskCompleteUseCase } from '../toggle-task-complete.use-case';

describe('ToggleTaskCompleteUseCase', () => {
  let useCase: ToggleTaskCompleteUseCase;
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

    useCase = new ToggleTaskCompleteUseCase(mockTaskRepository);
  });

  describe('execute', () => {
    const taskId = 'task-123';
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const otherUserId = '987e6543-e21c-34b5-a654-321987654321';

    const incompleteTask = new Task(
      taskId,
      'Test Task',
      'Test description',
      false, // not completed
      new Priority('media'),
      new Date('2024-12-31'),
      userId,
      'cat-1',
      new Date('2024-01-01'),
      new Date('2024-01-01')
    );

    const completedTask = new Task(
      taskId,
      'Test Task',
      'Test description',
      true, // completed
      new Priority('media'),
      new Date('2024-12-31'),
      userId,
      'cat-1',
      new Date('2024-01-01'),
      new Date('2024-01-02')
    );

    it('should toggle task completion successfully when user owns the task', async () => {
      // Arrange
      mockTaskRepository.findById.mockResolvedValue(incompleteTask);
      mockTaskRepository.toggleComplete.mockResolvedValue(completedTask);

      // Act
      const result = await useCase.execute(taskId, userId);

      // Assert
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.toggleComplete).toHaveBeenCalledWith(taskId);

      expect(result).toEqual({
        id: taskId,
        title: 'Test Task',
        description: 'Test description',
        completed: true,
        priority: 'media',
        dueDate: new Date('2024-12-31'),
        userId: userId,
        categoryId: 'cat-1',
        createdAt: completedTask.createdAt,
        updatedAt: completedTask.updatedAt
      });
    });

    it('should toggle completed task to incomplete', async () => {
      // Arrange
      mockTaskRepository.findById.mockResolvedValue(completedTask);
      mockTaskRepository.toggleComplete.mockResolvedValue(incompleteTask);

      // Act
      const result = await useCase.execute(taskId, userId);

      // Assert
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(mockTaskRepository.toggleComplete).toHaveBeenCalledWith(taskId);

      expect(result.completed).toBe(false);
    });

    it('should throw NotFoundError when task does not exist', async () => {
      // Arrange
      mockTaskRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(taskId, userId)).rejects.toThrow(NotFoundError);
      await expect(useCase.execute(taskId, userId)).rejects.toThrow('Task not found');
      expect(mockTaskRepository.toggleComplete).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError when user does not own the task', async () => {
      // Arrange
      mockTaskRepository.findById.mockResolvedValue(incompleteTask);

      // Act & Assert
      await expect(useCase.execute(taskId, otherUserId)).rejects.toThrow(ForbiddenError);
      await expect(useCase.execute(taskId, otherUserId)).rejects.toThrow('You can only modify your own tasks');
      expect(mockTaskRepository.toggleComplete).not.toHaveBeenCalled();
    });

    it('should handle repository findById errors', async () => {
      // Arrange
      mockTaskRepository.findById.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(useCase.execute(taskId, userId)).rejects.toThrow('Database error');
      expect(mockTaskRepository.toggleComplete).not.toHaveBeenCalled();
    });

    it('should handle repository toggleComplete errors', async () => {
      // Arrange
      mockTaskRepository.findById.mockResolvedValue(incompleteTask);
      mockTaskRepository.toggleComplete.mockRejectedValue(new Error('Toggle error'));

      // Act & Assert
      await expect(useCase.execute(taskId, userId)).rejects.toThrow('Toggle error');
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

      const toggledTask = new Task(
        taskId,
        'Task without category',
        'Test description',
        true,
        new Priority('media'),
        new Date('2024-12-31'),
        userId,
        null,
        new Date('2024-01-01'),
        new Date('2024-01-02')
      );

      mockTaskRepository.findById.mockResolvedValue(taskWithoutCategory);
      mockTaskRepository.toggleComplete.mockResolvedValue(toggledTask);

      // Act
      const result = await useCase.execute(taskId, userId);

      // Assert
      expect(result.categoryId).toBeNull();
      expect(result.completed).toBe(true);
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

      const toggledTask = new Task(
        taskId,
        'Task without due date',
        'Test description',
        true,
        new Priority('media'),
        null,
        userId,
        'cat-1',
        new Date('2024-01-01'),
        new Date('2024-01-02')
      );

      mockTaskRepository.findById.mockResolvedValue(taskWithoutDueDate);
      mockTaskRepository.toggleComplete.mockResolvedValue(toggledTask);

      // Act
      const result = await useCase.execute(taskId, userId);

      // Assert
      expect(result.dueDate).toBeNull();
      expect(result.completed).toBe(true);
    });

    it('should work with tasks that have no description', async () => {
      // Arrange
      const taskWithoutDescription = new Task(
        taskId,
        'Task without description',
        null, // no description
        false,
        new Priority('alta'),
        new Date('2024-12-31'),
        userId,
        'cat-1',
        new Date('2024-01-01'),
        new Date('2024-01-01')
      );

      const toggledTask = new Task(
        taskId,
        'Task without description',
        null,
        true,
        new Priority('alta'),
        new Date('2024-12-31'),
        userId,
        'cat-1',
        new Date('2024-01-01'),
        new Date('2024-01-02')
      );

      mockTaskRepository.findById.mockResolvedValue(taskWithoutDescription);
      mockTaskRepository.toggleComplete.mockResolvedValue(toggledTask);

      // Act
      const result = await useCase.execute(taskId, userId);

      // Assert
      expect(result.description).toBeNull();
      expect(result.completed).toBe(true);
      expect(result.priority).toBe('alta');
    });
  });
});
