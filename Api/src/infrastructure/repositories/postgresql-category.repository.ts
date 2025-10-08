import { Pool } from 'pg';
import { Category } from '../../domain/entities/category';
import { CategoryRepository } from '../../domain/repositories/category.repository';
import { CreateCategoryDto, UpdateCategoryDto } from '../../domain/repositories/types';
import { ConflictError } from '../../shared/errors/conflict.error';
import { NotFoundError } from '../../shared/errors/not-found.error';
import { logger } from '../logging/logger';

export class PostgreSQLCategoryRepository implements CategoryRepository {
  constructor(private readonly db: Pool) { }

  async create(category: CreateCategoryDto): Promise<Category> {
    const client = await this.db.connect();

    try {
      // Check if category name already exists for this user
      const existsResult = await client.query(
        'SELECT id FROM categorias WHERE name = $1 AND usuario_id = $2',
        [category.name, category.userId]
      );

      if (existsResult.rows.length > 0) {
        throw new ConflictError('Category name already exists for this user');
      }

      // Insert new category
      const insertQuery = `
        INSERT INTO categorias (name, color, usuario_id)
        VALUES ($1, $2, $3)
        RETURNING id, name, color, usuario_id
      `;

      const result = await client.query(insertQuery, [
        category.name,
        category.color || null,
        category.userId
      ]);

      const row = result.rows[0];

      logger.info('Category created successfully', {
        categoryId: row.id,
        userId: row.usuario_id,
        name: row.name
      });

      return new Category(
        row.id,
        row.name,
        row.color,
        row.usuario_id
      );
    } catch (error) {
      logger.error('Error creating category', { error, category });
      throw error;
    } finally {
      client.release();
    }
  }

  async findByUserId(userId: string): Promise<Category[]> {
    const client = await this.db.connect();

    try {
      const query = `
        SELECT id, name, color, usuario_id
        FROM categorias
        WHERE usuario_id = $1
        ORDER BY name ASC
      `;

      const result = await client.query(query, [userId]);

      return result.rows.map(row => new Category(
        row.id,
        row.name,
        row.color,
        row.usuario_id
      ));
    } catch (error) {
      logger.error('Error finding categories by user ID', { error, userId });
      throw error;
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<Category | null> {
    const client = await this.db.connect();

    try {
      const query = `
        SELECT id, name, color, usuario_id
        FROM categorias
        WHERE id = $1
      `;

      const result = await client.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return new Category(
        row.id,
        row.name,
        row.color,
        row.usuario_id
      );
    } catch (error) {
      logger.error('Error finding category by ID', { error, categoryId: id });
      throw error;
    } finally {
      client.release();
    }
  }

  async update(id: string, updates: UpdateCategoryDto): Promise<Category> {
    const client = await this.db.connect();

    try {
      // First check if category exists
      const existingCategory = await this.findById(id);
      if (!existingCategory) {
        throw new NotFoundError('Category not found');
      }

      // Check for name conflicts if name is being updated
      if (updates.name && updates.name !== existingCategory.name) {
        const conflictResult = await client.query(
          'SELECT id FROM categorias WHERE name = $1 AND usuario_id = $2 AND id != $3',
          [updates.name, existingCategory.userId, id]
        );

        if (conflictResult.rows.length > 0) {
          throw new ConflictError('Category name already exists for this user');
        }
      }

      const updateFields: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (updates.name !== undefined) {
        updateFields.push(`name = $${paramIndex}`);
        params.push(updates.name);
        paramIndex++;
      }

      if (updates.color !== undefined) {
        updateFields.push(`color = $${paramIndex}`);
        params.push(updates.color);
        paramIndex++;
      }

      if (updateFields.length === 0) {
        return existingCategory;
      }

      params.push(id);

      const query = `
        UPDATE categorias
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, name, color, usuario_id
      `;

      const result = await client.query(query, params);
      const row = result.rows[0];

      logger.info('Category updated successfully', { categoryId: id });

      return new Category(
        row.id,
        row.name,
        row.color,
        row.usuario_id
      );
    } catch (error) {
      logger.error('Error updating category', { error, categoryId: id, updates });
      throw error;
    } finally {
      client.release();
    }
  }

  async delete(id: string): Promise<void> {
    const client = await this.db.connect();

    try {
      await client.query('BEGIN');

      // First, set categoria_id to NULL for all tasks that reference this category
      await client.query(
        'UPDATE tareas SET categoria_id = NULL WHERE categoria_id = $1',
        [id]
      );

      // Then delete the category
      const result = await client.query('DELETE FROM categorias WHERE id = $1', [id]);

      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        throw new NotFoundError('Category not found');
      }

      await client.query('COMMIT');

      logger.info('Category deleted successfully', { categoryId: id });
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error deleting category', { error, categoryId: id });
      throw error;
    } finally {
      client.release();
    }
  }

  async existsByNameForUser(userId: string, name: string, excludeId?: string): Promise<boolean> {
    const client = await this.db.connect();

    try {
      let query = 'SELECT 1 FROM categorias WHERE name = $1 AND usuario_id = $2';
      const params: any[] = [name, userId];

      if (excludeId) {
        query += ' AND id != $3';
        params.push(excludeId);
      }

      query += ' LIMIT 1';

      const result = await client.query(query, params);
      return result.rows.length > 0;
    } catch (error) {
      logger.error('Error checking if category exists by name for user', {
        error,
        userId,
        name,
        excludeId
      });
      throw error;
    } finally {
      client.release();
    }
  }
}
