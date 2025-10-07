import { Task } from '../entities/task';
import { Priority } from '../value-objects/priority';

describe('Task Entity', () => {
  const validTaskData = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    titulo: 'Test Task',
    descripcion: 'Test description',
    completada: false,
    prioridad: new Priority('media'),
    fechaVencimiento: new Date('2024-12-31T23:59:59Z'),
    usuarioId: 'user-123',
    categoriaId: 'category-123',
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2023-01-01T00:00:00Z')
  };

  describe('constructor', () => {
    it('should create task with valid data', () => {
      const task = new Task(
        validTaskData.id,
        validTaskData.titulo,
        validTaskData.descripcion,
        validTaskData.completada,
        validTaskData.prioridad,
        validTaskData.fechaVencimiento,
        validTaskData.usuarioId,
        validTaskData.categoriaId,
        validTaskData.createdAt,
        validTaskData.updatedAt
      );

      expect(task.id).toBe(validTaskData.id);
      expect(task.title).toBe(validTaskData.titulo);
      expect(task.completed).toBe(validTaskData.completada);
      expect(task.priority).toBe(validTaskData.prioridad);
    });

    it('should throw error for empty title', () => {
      expect(() => new Task(
        validTaskData.id,
        '',
        validTaskData.descripcion,
        validTaskData.completada,
        validTaskData.prioridad,
        validTaskData.fechaVencimiento,
        validTaskData.usuarioId,
        validTaskData.categoriaId,
        validTaskData.createdAt,
        validTaskData.updatedAt
      )).toThrow('Task title cannot be empty');
    });

    it('should throw error for title too long', () => {
      const longTitle = 'a'.repeat(256);
      expect(() => new Task(
        validTaskData.id,
        longTitle,
        validTaskData.descripcion,
        validTaskData.completada,
        validTaskData.prioridad,
        validTaskData.fechaVencimiento,
        validTaskData.usuarioId,
        validTaskData.categoriaId,
        validTaskData.createdAt,
        validTaskData.updatedAt
      )).toThrow('Task title cannot exceed 255 characters');
    });
  });

  describe('belongsToUser', () => {
    it('should return true for correct user', () => {
      const task = new Task(
        validTaskData.id,
        validTaskData.titulo,
        validTaskData.descripcion,
        validTaskData.completada,
        validTaskData.prioridad,
        validTaskData.fechaVencimiento,
        validTaskData.usuarioId,
        validTaskData.categoriaId,
        validTaskData.createdAt,
        validTaskData.updatedAt
      );

      expect(task.belongsToUser('user-123')).toBe(true);
      expect(task.belongsToUser('different-user')).toBe(false);
    });
  });

  describe('getPriorityLevel', () => {
    it('should return priority level as string', () => {
      const task = new Task(
        validTaskData.id,
        validTaskData.titulo,
        validTaskData.descripcion,
        validTaskData.completada,
        validTaskData.prioridad,
        validTaskData.fechaVencimiento,
        validTaskData.usuarioId,
        validTaskData.categoriaId,
        validTaskData.createdAt,
        validTaskData.updatedAt
      );

      expect(task.getPriorityLevel()).toBe('media');
    });
  });

  describe('withCompletionStatus', () => {
    it('should create new task with updated completion status', () => {
      const originalTask = new Task(
        validTaskData.id,
        validTaskData.titulo,
        validTaskData.descripcion,
        false,
        validTaskData.prioridad,
        validTaskData.fechaVencimiento,
        validTaskData.usuarioId,
        validTaskData.categoriaId,
        validTaskData.createdAt,
        validTaskData.updatedAt
      );

      const updatedTask = Task.withCompletionStatus(originalTask, true);

      expect(updatedTask.completed).toBe(true);
      expect(updatedTask.id).toBe(originalTask.id);
      expect(updatedTask.title).toBe(originalTask.title);
      expect(updatedTask.updatedAt).not.toBe(originalTask.updatedAt);
    });
  });
});