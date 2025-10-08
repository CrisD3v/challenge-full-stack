import { Pool, PoolClient } from 'pg';
import { Category } from '../../../domain/entities/category';
import { CreateCategoryDto, UpdateCategoryDto } from '../../../domain/repositories/types';
import { ConflictError } from '../../../shared/errors/conflict.error';
import { NotFoundError } from '../../../shared/errors/not-found.error';
import { PostgreSQLCategoryRepository } from '../postgresql-category.repository';

// Mock the logger
jest.mock('../../logging/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn()
  }
}));

describe('PostgreSQLCategoryRepository', () => {
  let repository: PostgreSQLCategoryRepository;
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

    repository = new PostgreSQLCategoryRepository(mockPool);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createCategoryDto: CreateCategoryDto = {
      name: 'Work',
      color: '#FF0000',
      userId: 'user-123'
    };

    const mockCategoryRow = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Work',
      color: '#FF0000',
      usuario_id: 'user-123'
    };

    it('should create category successfully', async () => {
      // Mock name uniqueness check (no existing category)
      (mockClient.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [] })
        // Mock category creation
        .mockResolvedValueOnce({ rows: [mockCategoryRow] });

      const result = await repository.create(createCategoryDto);

      expect(result).toBeInstanceOf(Category);
      expect(result.id).toBe(mockCategoryRow.id);
      expect(result.name).toBe(mockCategoryRow.name);
      expect(result.color).toBe(mockCategoryRow.color);
      expect(result.userId).toBe(mockCategoryRow.usuario_id);

      expect(mockClient.query).toHaveBeenCalledTimes(2);
      expect(mockClient.query).toHaveBeenNthCalledWith(1,
        'SELECT id FROM categorias WHERE name = $1 AND usuario_id = $2',
        [createCategoryDto.name, createCategoryDto.userId]
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should create category with null color', async () => {
      const categoryWithoutColor: CreateCategoryDto = {
        name: 'Personal',
        userId: 'user-123'
      };

      const categoryRowWithoutColor = {
        ...mockCategoryRow,
        name: 'Personal',
        color: null
      };

      (mockClient.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [categoryRowWithoutColor] });

      const result = await repository.create(categoryWithoutColor);

      expect(result.color).toBeNull();
      expect(mockClient.query).toHaveBeenNthCalledWith(2,
        expect.stringContaining('INSERT INTO categorias'),
        [categoryWithoutColor.name, null, categoryWithoutColor.userId]
      );
    });

    it('should throw ConflictError when category name already exists for user', async () => {
      // Mock name uniqueness check (existing category found)
      (mockClient.query as jest.Mock).mockResolvedValueOnce({
        rows: [{ id: 'existing-category-id' }]
      });

      await expect(repository.create(createCategoryDto))
        .rejects
        .toThrow(ConflictError);

      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should release client on database error', async () => {
      const dbError = new Error('Database error');
      (mockClient.query as jest.Mock).mockRejectedValueOnce(dbError);

      await expect(repository.create(createCategoryDto))
        .rejects
        .toThrow(dbError);

      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('findByUserId', () => {
    const userId = 'user-123';
    const mockCategoryRows = [
      {
        id: 'category-1',
        name: 'Personal',
        color: '#FF0000',
        usuario_id: userId
      },
      {
        id: 'category-2',
        name: 'Work',
        color: null,
        usuario_id: userId
      }
    ];

    it('should return categories for user', async () => {
      (mockClient.query as jest.Mock).mockResolvedValueOnce({ rows: mockCategoryRows });

      const result = await repository.findByUserId(userId);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Category);
      expect(result[0]!.id).toBe('category-1');
      expect(result[1]!.id).toBe('category-2');

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE usuario_id = $1'),
        [userId]
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should return empty array when no categories found', async () => {
      (mockClient.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const result = await repository.findByUserId(userId);

      expect(result).toEqual([]);
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should release client on database error', async () => {
      const dbError = new Error('Database error');
      (mockClient.query as jest.Mock).mockRejectedValueOnce(dbError);

      await expect(repository.findByUserId(userId))
        .rejects
        .toThrow(dbError);

      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    const categoryId = 'category-123';
    const mockCategoryRow = {
      id: categoryId,
      name: 'Work',
      color: '#FF0000',
      usuario_id: 'user-123'
    };

    it('should return category when found', async () => {
      (mockClient.query as jest.Mock).mockResolvedValueOnce({ rows: [mockCategoryRow] });

      const result = await repository.findById(categoryId);

      expect(result).toBeInstanceOf(Category);
      expect(result!.id).toBe(categoryId);
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, name, color, usuario_id'),
        [categoryId]
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should return null when category not found', async () => {
      (mockClient.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const result = await repository.findById(categoryId);

      expect(result).toBeNull();
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const categoryId = 'category-123';
    const existingCategory = new Category(
      categoryId,
      'Original Name',
      '#FF0000',
      'user-123'
    );

    const updateDto: UpdateCategoryDto = {
      name: 'Updated Name',
      color: '#00FF00'
    };

    const updatedCategoryRow = {
      id: categoryId,
      name: 'Updated Name',
      color: '#00FF00',
      usuario_id: 'user-123'
    };

    it('should update category successfully', async () => {
      // Mock findById call
      jest.spyOn(repository, 'findById').mockResolvedValueOnce(existingCategory);
      // Mock name conflict check (no conflict)
      (mockClient.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [] })
        // Mock update query
        .mockResolvedValueOnce({ rows: [updatedCategoryRow] });

      const result = await repository.update(categoryId, updateDto);

      expect(result).toBeInstanceOf(Category);
      expect(result.name).toBe('Updated Name');
      expect(result.color).toBe('#00FF00');

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE categorias'),
        expect.arrayContaining(['Updated Name', '#00FF00', categoryId])
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should throw NotFoundError when category does not exist', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValueOnce(null);

      await expect(repository.update(categoryId, updateDto))
        .rejects
        .toThrow(NotFoundError);

      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should throw ConflictError when name already exists for user', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValueOnce(existingCategory);
      // Mock name conflict check (conflict found)
      (mockClient.query as jest.Mock).mockResolvedValueOnce({
        rows: [{ id: 'other-category-id' }]
      });

      await expect(repository.update(categoryId, { name: 'Existing Name' }))
        .rejects
        .toThrow(ConflictError);

      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should return existing category when no updates provided', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValueOnce(existingCategory);

      const result = await repository.update(categoryId, {});

      expect(result).toBe(existingCategory);
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should not check name conflict when name is not being updated', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValueOnce(existingCategory);
      (mockClient.query as jest.Mock).mockResolvedValueOnce({ rows: [updatedCategoryRow] });

      await repository.update(categoryId, { color: '#00FF00' });

      // Should only call update query, not name conflict check
      expect(mockClient.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    const categoryId = 'category-123';

    it('should delete category successfully', async () => {
      (mockClient.query as jest.Mock)
        // Mock BEGIN transaction
        .mockResolvedValueOnce({})
        // Mock update tasks to remove category reference
        .mockResolvedValueOnce({ rowCount: 2 })
        // Mock category deletion
        .mockResolvedValueOnce({ rowCount: 1 })
        // Mock COMMIT transaction
        .mockResolvedValueOnce({});

      await repository.delete(categoryId);

      expect(mockClient.query).toHaveBeenCalledTimes(4);
      expect(mockClient.query).toHaveBeenNthCalledWith(1, 'BEGIN');
      expect(mockClient.query).toHaveBeenNthCalledWith(2,
        'UPDATE tareas SET categoria_id = NULL WHERE categoria_id = $1',
        [categoryId]
      );
      expect(mockClient.query).toHaveBeenNthCalledWith(3,
        'DELETE FROM categorias WHERE id = $1',
        [categoryId]
      );
      expect(mockClient.query).toHaveBeenNthCalledWith(4, 'COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should throw NotFoundError when category does not exist', async () => {
      (mockClient.query as jest.Mock)
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rowCount: 0 }) // update tasks
        .mockResolvedValueOnce({ rowCount: 0 }) // delete category (not found)
        .mockResolvedValueOnce({}); // ROLLBACK

      await expect(repository.delete(categoryId))
        .rejects
        .toThrow(NotFoundError);

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should rollback transaction on error', async () => {
      const dbError = new Error('Database error');
      (mockClient.query as jest.Mock)
        .mockResolvedValueOnce({}) // BEGIN
        .mockRejectedValueOnce(dbError); // error on update tasks

      await expect(repository.delete(categoryId))
        .rejects
        .toThrow(dbError);

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('existsByNameForUser', () => {
    const userId = 'user-123';
    const categoryName = 'Work';

    it('should return true when category exists', async () => {
      (mockClient.query as jest.Mock).mockResolvedValueOnce({
        rows: [{ '?column?': 1 }]
      });

      const result = await repository.existsByNameForUser(userId, categoryName);

      expect(result).toBe(true);
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT 1 FROM categorias WHERE name = $1 AND usuario_id = $2'),
        [categoryName, userId]
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should return false when category does not exist', async () => {
      (mockClient.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const result = await repository.existsByNameForUser(userId, categoryName);

      expect(result).toBe(false);
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should exclude specific category ID when provided', async () => {
      const excludeId = 'category-to-exclude';
      (mockClient.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      await repository.existsByNameForUser(userId, categoryName, excludeId);

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('AND id != $3'),
        [categoryName, userId, excludeId]
      );
    });
  });
});
