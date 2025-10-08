import { Pool, PoolClient } from 'pg';
import { Tag } from '../../../domain/entities/tag';
import { CreateTagDto } from '../../../domain/repositories/types';
import { ConflictError } from '../../../shared/errors/conflict.error';
import { NotFoundError } from '../../../shared/errors/not-found.error';
import { PostgreSQLTagRepository } from '../postgresql-tag.repository';

// Mock the logger
jest.mock('../../logging/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn()
  }
}));

describe('PostgreSQLTagRepository', () => {
  let repository: PostgreSQLTagRepository;
  let mockPool: jest.Mocked<Pool>;
  let mockClient: jest.Mocked<PoolClient>;

  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
      release: jest.fn()
    } as any;

    mockPool = {
      connect: jest.fn().mockResolvedValue(mockClient)
    } as any;

    repository = new PostgreSQLTagRepository(mockPool);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createTagDto: CreateTagDto = {
      name: 'urgent',
      userId: 'user-123'
    };

    const mockTagRow = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'urgent',
      usuario_id: 'user-123'
    };

    it('should create tag successfully', async () => {
      // Mock name uniqueness check (no existing tag)
      (mockClient.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [] })
        // Mock tag creation
        .mockResolvedValueOnce({ rows: [mockTagRow] });

      const result = await repository.create(createTagDto);

      expect(result).toBeInstanceOf(Tag);
      expect(result.id).toBe(mockTagRow.id);
      expect(result.name).toBe(mockTagRow.name);
      expect(result.userId).toBe(mockTagRow.usuario_id);

      expect(mockClient.query).toHaveBeenCalledTimes(2);
      expect(mockClient.query).toHaveBeenNthCalledWith(1,
        'SELECT id FROM etiquetas WHERE name = $1 AND usuario_id = $2',
        [createTagDto.name, createTagDto.userId]
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should throw ConflictError when tag name already exists for user', async () => {
      // Mock name uniqueness check (existing tag found)
      (mockClient.query as jest.Mock).mockResolvedValueOnce({
        rows: [{ id: 'existing-tag-id' }]
      });

      await expect(repository.create(createTagDto))
        .rejects
        .toThrow(ConflictError);

      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should release client on database error', async () => {
      const dbError = new Error('Database error');
      (mockClient.query as jest.Mock).mockRejectedValueOnce(dbError);

      await expect(repository.create(createTagDto))
        .rejects
        .toThrow(dbError);

      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('findByUserId', () => {
    const userId = 'user-123';
    const mockTagRows = [
      {
        id: 'tag-1',
        name: 'important',
        usuario_id: userId
      },
      {
        id: 'tag-2',
        name: 'urgent',
        usuario_id: userId
      }
    ];

    it('should return tags for user', async () => {
      (mockClient.query as jest.Mock).mockResolvedValueOnce({ rows: mockTagRows });

      const result = await repository.findByUserId(userId);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Tag);
      expect(result[0]!.id).toBe('tag-1');
      expect(result[1]!.id).toBe('tag-2');

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE usuario_id = $1'),
        [userId]
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should return empty array when no tags found', async () => {
      (mockClient.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const result = await repository.findByUserId(userId);

      expect(result).toEqual([]);
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    const tagId = 'tag-123';
    const mockTagRow = {
      id: tagId,
      name: 'urgent',
      usuario_id: 'user-123'
    };

    it('should return tag when found', async () => {
      (mockClient.query as jest.Mock).mockResolvedValueOnce({ rows: [mockTagRow] });

      const result = await repository.findById(tagId);

      expect(result).toBeInstanceOf(Tag);
      expect(result!.id).toBe(tagId);
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, name, usuario_id'),
        [tagId]
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should return null when tag not found', async () => {
      (mockClient.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const result = await repository.findById(tagId);

      expect(result).toBeNull();
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('findByIds', () => {
    const tagIds = ['tag-1', 'tag-2'];
    const mockTagRows = [
      {
        id: 'tag-1',
        name: 'important',
        usuario_id: 'user-123'
      },
      {
        id: 'tag-2',
        name: 'urgent',
        usuario_id: 'user-123'
      }
    ];

    it('should return tags when found', async () => {
      (mockClient.query as jest.Mock).mockResolvedValueOnce({ rows: mockTagRows });

      const result = await repository.findByIds(tagIds);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Tag);
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id = ANY($1)'),
        [tagIds]
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should return empty array when no IDs provided', async () => {
      const result = await repository.findByIds([]);

      expect(result).toEqual([]);
      expect(mockClient.query).not.toHaveBeenCalled();
    });
  });

  describe('addToTask', () => {
    const taskId = 'task-123';
    const tagIds = ['tag-1', 'tag-2'];

    it('should add tags to task successfully', async () => {
      (mockClient.query as jest.Mock)
        // Mock BEGIN transaction
        .mockResolvedValueOnce({})
        // Mock task existence check
        .mockResolvedValueOnce({ rows: [{ id: taskId }] })
        // Mock tags existence check
        .mockResolvedValueOnce({ rows: [{ id: 'tag-1' }, { id: 'tag-2' }] })
        // Mock delete existing associations
        .mockResolvedValueOnce({ rowCount: 0 })
        // Mock insert new associations
        .mockResolvedValueOnce({ rowCount: 2 })
        // Mock COMMIT transaction
        .mockResolvedValueOnce({});

      await repository.addToTask(taskId, tagIds);

      expect(mockClient.query).toHaveBeenCalledTimes(6);
      expect(mockClient.query).toHaveBeenNthCalledWith(1, 'BEGIN');
      expect(mockClient.query).toHaveBeenNthCalledWith(2,
        'SELECT id FROM tareas WHERE id = $1',
        [taskId]
      );
      expect(mockClient.query).toHaveBeenNthCalledWith(3,
        'SELECT id FROM etiquetas WHERE id = ANY($1)',
        [tagIds]
      );
      expect(mockClient.query).toHaveBeenNthCalledWith(6, 'COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should do nothing when no tag IDs provided', async () => {
      await repository.addToTask(taskId, []);

      expect(mockClient.query).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when task does not exist', async () => {
      (mockClient.query as jest.Mock)
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [] }) // task not found
        .mockResolvedValueOnce({}); // ROLLBACK

      await expect(repository.addToTask(taskId, tagIds))
        .rejects
        .toThrow(NotFoundError);

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should throw NotFoundError when some tags do not exist', async () => {
      (mockClient.query as jest.Mock)
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: taskId }] }) // task exists
        .mockResolvedValueOnce({ rows: [{ id: 'tag-1' }] }) // only one tag found
        .mockResolvedValueOnce({}); // ROLLBACK

      await expect(repository.addToTask(taskId, tagIds))
        .rejects
        .toThrow(NotFoundError);

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should rollback transaction on error', async () => {
      const dbError = new Error('Database error');
      (mockClient.query as jest.Mock)
        .mockResolvedValueOnce({}) // BEGIN
        .mockRejectedValueOnce(dbError); // error on task check

      await expect(repository.addToTask(taskId, tagIds))
        .rejects
        .toThrow(dbError);

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('removeFromTask', () => {
    const taskId = 'task-123';
    const tagIds = ['tag-1', 'tag-2'];

    it('should remove tags from task successfully', async () => {
      (mockClient.query as jest.Mock).mockResolvedValueOnce({ rowCount: 2 });

      await repository.removeFromTask(taskId, tagIds);

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM tarea_etiquetas'),
        [taskId, tagIds]
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should do nothing when no tag IDs provided', async () => {
      await repository.removeFromTask(taskId, []);

      expect(mockClient.query).not.toHaveBeenCalled();
    });

    it('should release client on database error', async () => {
      const dbError = new Error('Database error');
      (mockClient.query as jest.Mock).mockRejectedValueOnce(dbError);

      await expect(repository.removeFromTask(taskId, tagIds))
        .rejects
        .toThrow(dbError);

      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('findByTaskId', () => {
    const taskId = 'task-123';
    const mockTagRows = [
      {
        id: 'tag-1',
        name: 'important',
        usuario_id: 'user-123'
      },
      {
        id: 'tag-2',
        name: 'urgent',
        usuario_id: 'user-123'
      }
    ];

    it('should return tags for task', async () => {
      (mockClient.query as jest.Mock).mockResolvedValueOnce({ rows: mockTagRows });

      const result = await repository.findByTaskId(taskId);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Tag);
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INNER JOIN tarea_etiquetas te'),
        [taskId]
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should return empty array when no tags found for task', async () => {
      (mockClient.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const result = await repository.findByTaskId(taskId);

      expect(result).toEqual([]);
    });
  });

  describe('existsByNameForUser', () => {
    const userId = 'user-123';
    const tagName = 'urgent';

    it('should return true when tag exists', async () => {
      (mockClient.query as jest.Mock).mockResolvedValueOnce({
        rows: [{ '?column?': 1 }]
      });

      const result = await repository.existsByNameForUser(userId, tagName);

      expect(result).toBe(true);
      expect(mockClient.query).toHaveBeenCalledWith(
        'SELECT 1 FROM etiquetas WHERE name = $1 AND usuario_id = $2 LIMIT 1',
        [tagName, userId]
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should return false when tag does not exist', async () => {
      (mockClient.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const result = await repository.existsByNameForUser(userId, tagName);

      expect(result).toBe(false);
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('removeAllFromTask', () => {
    const taskId = 'task-123';

    it('should remove all tags from task successfully', async () => {
      (mockClient.query as jest.Mock).mockResolvedValueOnce({ rowCount: 3 });

      await repository.removeAllFromTask(taskId);

      expect(mockClient.query).toHaveBeenCalledWith(
        'DELETE FROM tarea_etiquetas WHERE tarea_id = $1',
        [taskId]
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should release client on database error', async () => {
      const dbError = new Error('Database error');
      (mockClient.query as jest.Mock).mockRejectedValueOnce(dbError);

      await expect(repository.removeAllFromTask(taskId))
        .rejects
        .toThrow(dbError);

      expect(mockClient.release).toHaveBeenCalled();
    });
  });
});
