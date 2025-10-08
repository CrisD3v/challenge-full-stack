import { Task } from '../../../domain/entities/task';
import { TaskRepository } from '../../../domain/repositories/task.repository';
import { Priority } from '../../../domain/value-objects/priority';
import { ValidationError } from '../../../shared/errors/validation.error';
import { GetTasksUseCase } from '../get-tasks.use-case';

describe('GetTasksUseCase', () => {
  let useCase: GetTasksUseCase;
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

    useCase = new GetTasksUseCase(mockTaskRepository);
  });

  describe('execute', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';

    const mockTasks = [
      new Task(
        'task-1',
        'Task 1',
        'Description 1',
        false,
        new Priority('alta'),
        new Date('2024-12-31'),
        userId,
        'cat-1',
        new Date('2024-01-01'),
        new Date('2024-01-01')
      ),
      new Task(
        'task-2',
        'Task 2',
        null,
        true,
        new Priority('media'),
        null,
        userId,
        null,
        new Date('2024-01-02'),
        new Date('2024-01-02')
      )
    ];

    it('should get tasks successfully without filters', async () => {
      // Arrange
      mockTaskRepository.findByUserId.mockResolvedValue(mockTasks);
      mockTaskRepository.countByUserId.mockResolvedValue(2);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(mockTaskRepository.findByUserId).toHaveBeenCalledWith(userId, {
        limit: 50,
        offset: 0
      });
      expect(mockTaskRepository.countByUserId).toHaveBeenCalledWith(userId, {});

      expect(result).toEqual({
        tasks: [
          {
            id: 'task-1',
            title: 'Task 1',
            description: 'Description 1',
            completed: false,
            priority: 'alta',
            dueDate: new Date('2024-12-31'),
            userId: userId,
            categoryId: 'cat-1',
            createdAt: mockTasks[0]!.createdAt,
            updatedAt: mockTasks[0]!.updatedAt
          },
          {
            id: 'task-2',
            title: 'Task 2',
            description: null,
            completed: true,
            priority: 'media',
            dueDate: null,
            userId: userId,
            categoryId: null,
            createdAt: mockTasks[1]!.createdAt,
            updatedAt: mockTasks[1]!.updatedAt
          }
        ],
        total: 2,
        limit: 50,
        offset: 0
      });
    });

    it('should get tasks with filters', async () => {
      // Arrange
      const filters = {
        completed: false,
        category: 'cat-1',
        priority: 'alta' as const,
        search: 'test',
        tags: ['tag-1', 'tag-2'],
        order: 'title' as const,
        direction: 'asc' as const,
        limit: 10,
        offset: 5
      };

      mockTaskRepository.findByUserId.mockResolvedValue([mockTasks[0]!]);
      mockTaskRepository.countByUserId.mockResolvedValue(1);

      // Act
      const result = await useCase.execute(userId, filters);

      // Assert
      expect(mockTaskRepository.findByUserId).toHaveBeenCalledWith(userId, {
        completed: false,
        category: 'cat-1',
        priority: 'alta',
        search: 'test',
        tags: ['tag-1', 'tag-2'],
        order: 'title',
        direction: 'asc',
        limit: 10,
        offset: 5
      });

      expect(result.tasks).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(5);
    });

    it('should handle date filters', async () => {
      // Arrange
      const filters = {
        dueDate: {
          since: '2024-01-01T00:00:00.000Z',
          until: '2024-12-31T23:59:59.000Z'
        }
      };

      mockTaskRepository.findByUserId.mockResolvedValue(mockTasks);
      mockTaskRepository.countByUserId.mockResolvedValue(2);

      // Act
      const result = await useCase.execute(userId, filters);

      // Assert
      expect(mockTaskRepository.findByUserId).toHaveBeenCalledWith(userId, {
        dueDate: {
          since: new Date('2024-01-01T00:00:00.000Z'),
          until: new Date('2024-12-31T23:59:59.000Z')
        },
        limit: 50,
        offset: 0
      });
    });

    it('should throw ValidationError for invalid priority', async () => {
      // Arrange
      const filters = {
        priority: 'invalid' as any
      };

      // Act & Assert
      await expect(useCase.execute(userId, filters)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(userId, filters)).rejects.toThrow('Priority must be baja, media, or alta');
    });

    it('should throw ValidationError for invalid sort field', async () => {
      // Arrange
      const filters = {
        order: 'invalid' as any
      };

      // Act & Assert
      await expect(useCase.execute(userId, filters)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(userId, filters)).rejects.toThrow('Sort field must be one of: created_at, due_date, priority, title');
    });

    it('should throw ValidationError for invalid sort direction', async () => {
      // Arrange
      const filters = {
        direction: 'invalid' as any
      };

      // Act & Assert
      await expect(useCase.execute(userId, filters)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(userId, filters)).rejects.toThrow('Sort direction must be asc or desc');
    });

    it('should throw ValidationError for invalid limit', async () => {
      // Arrange
      const filters = {
        limit: 0
      };

      // Act & Assert
      await expect(useCase.execute(userId, filters)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(userId, filters)).rejects.toThrow('Limit must be at least 1');
    });

    it('should throw ValidationError for limit exceeding maximum', async () => {
      // Arrange
      const filters = {
        limit: 101
      };

      // Act & Assert
      await expect(useCase.execute(userId, filters)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(userId, filters)).rejects.toThrow('Limit cannot exceed 100');
    });

    it('should throw ValidationError for negative offset', async () => {
      // Arrange
      const filters = {
        offset: -1
      };

      // Act & Assert
      await expect(useCase.execute(userId, filters)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(userId, filters)).rejects.toThrow('Offset cannot be negative');
    });

    it('should throw ValidationError for invalid start date', async () => {
      // Arrange
      const filters = {
        dueDate: {
          since: 'invalid-date'
        }
      };

      // Act & Assert
      await expect(useCase.execute(userId, filters)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(userId, filters)).rejects.toThrow('Invalid start date format');
    });

    it('should throw ValidationError for invalid end date', async () => {
      // Arrange
      const filters = {
        dueDate: {
          until: 'invalid-date'
        }
      };

      // Act & Assert
      await expect(useCase.execute(userId, filters)).rejects.toThrow(ValidationError);
      await expect(useCase.execute(userId, filters)).rejects.toThrow('Invalid end date format');
    });

    it('should trim search query', async () => {
      // Arrange
      const filters = {
        search: '  test query  '
      };

      mockTaskRepository.findByUserId.mockResolvedValue([]);
      mockTaskRepository.countByUserId.mockResolvedValue(0);

      // Act
      await useCase.execute(userId, filters);

      // Assert
      expect(mockTaskRepository.findByUserId).toHaveBeenCalledWith(userId, {
        search: 'test query',
        limit: 50,
        offset: 0
      });
    });

    it('should filter out empty etiquetas array', async () => {
      // Arrange
      const filters = {
        tags: []
      };

      mockTaskRepository.findByUserId.mockResolvedValue([]);
      mockTaskRepository.countByUserId.mockResolvedValue(0);

      // Act
      await useCase.execute(userId, filters);

      // Assert
      expect(mockTaskRepository.findByUserId).toHaveBeenCalledWith(userId, {
        limit: 50,
        offset: 0
      });
    });

    it('should handle repository errors', async () => {
      // Arrange
      mockTaskRepository.findByUserId.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(useCase.execute(userId)).rejects.toThrow('Database error');
    });
  });
});
