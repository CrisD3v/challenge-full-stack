import { Pool } from 'pg';
import { Tag } from '../../domain/entities/tag';
import { TagRepository } from '../../domain/repositories/tag.repository';
import { CreateTagDto } from '../../domain/repositories/types';
import { ConflictError } from '../../shared/errors/conflict.error';
import { NotFoundError } from '../../shared/errors/not-found.error';
import { logger } from '../logging/logger';

export class PostgreSQLTagRepository implements TagRepository {
  constructor(private readonly db: Pool) { }

  async create(tag: CreateTagDto): Promise<Tag> {
    const client = await this.db.connect();

    try {
      // Check if tag name already exists for this user
      const existsResult = await client.query(
        'SELECT id FROM tags WHERE name = $1 AND user_id = $2',
        [tag.name, tag.userId]
      );

      if (existsResult.rows.length > 0) {
        throw new ConflictError('Tag name already exists for this user');
      }

      // Insert new tag
      const insertQuery = `
        INSERT INTO tags (name, user_id)
        VALUES ($1, $2)
        RETURNING id, name, user_id
      `;

      const result = await client.query(insertQuery, [
        tag.name,
        tag.userId
      ]);

      const row = result.rows[0];

      logger.info('Tag created successfully', {
        tagId: row.id,
        userId: row.user_id,
        name: row.name
      });

      return new Tag(
        row.id,
        row.name,
        row.user_id
      );
    } catch (error) {
      logger.error('Error creating tag', { error, tag });
      throw error;
    } finally {
      client.release();
    }
  }

  async findByUserId(userId: string): Promise<Tag[]> {
    const client = await this.db.connect();

    try {
      const query = `
        SELECT id, name, user_id
        FROM tags
        WHERE user_id = $1
        ORDER BY name ASC
      `;

      const result = await client.query(query, [userId]);

      return result.rows.map(row => new Tag(
        row.id,
        row.name,
        row.user_id
      ));
    } catch (error) {
      logger.error('Error finding tags by user ID', { error, userId });
      throw error;
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<Tag | null> {
    const client = await this.db.connect();

    try {
      const query = `
        SELECT id, name, user_id
        FROM tags
        WHERE id = $1
      `;

      const result = await client.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return new Tag(
        row.id,
        row.name,
        row.user_id
      );
    } catch (error) {
      logger.error('Error finding tag by ID', { error, tagId: id });
      throw error;
    } finally {
      client.release();
    }
  }

  async findByIds(ids: string[]): Promise<Tag[]> {
    if (ids.length === 0) {
      return [];
    }

    const client = await this.db.connect();

    try {
      const query = `
        SELECT id, name, user_id
        FROM tags
        WHERE id = ANY($1)
        ORDER BY name ASC
      `;

      const result = await client.query(query, [ids]);

      return result.rows.map(row => new Tag(
        row.id,
        row.name,
        row.user_id
      ));
    } catch (error) {
      logger.error('Error finding tags by IDs', { error, tagIds: ids });
      throw error;
    } finally {
      client.release();
    }
  }

  async addToTask(taskId: string, tagIds: string[]): Promise<void> {
    if (tagIds.length === 0) {
      return;
    }

    const client = await this.db.connect();

    try {
      await client.query('BEGIN');

      // First, verify that the task exists
      const taskResult = await client.query('SELECT id FROM tasks WHERE id = $1', [taskId]);
      if (taskResult.rows.length === 0) {
        throw new NotFoundError('Task not found');
      }

      // Verify that all tags exist
      const tagsResult = await client.query(
        'SELECT id FROM tags WHERE id = ANY($1)',
        [tagIds]
      );

      if (tagsResult.rows.length !== tagIds.length) {
        throw new NotFoundError('One or more tags not found');
      }

      // Remove existing associations to avoid duplicates
      await client.query(
        'DELETE FROM task_tags WHERE task_id = $1 AND tag_id = ANY($2)',
        [taskId, tagIds]
      );

      // Insert new associations
      const insertValues = tagIds.map((tagId, index) =>
        `($1, $${index + 2})`
      ).join(', ');

      const insertQuery = `
        INSERT INTO task_tags (task_id, tag_id)
        VALUES ${insertValues}
      `;

      await client.query(insertQuery, [taskId, ...tagIds]);

      await client.query('COMMIT');

      logger.info('Tags added to task successfully', { taskId, tagIds });
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error adding tags to task', { error, taskId, tagIds });
      throw error;
    } finally {
      client.release();
    }
  }

  async removeFromTask(taskId: string, tagIds: string[]): Promise<void> {
    if (tagIds.length === 0) {
      return;
    }

    const client = await this.db.connect();

    try {
      const query = `
        DELETE FROM task_tags
        WHERE task_id = $1 AND tag_id = ANY($2)
      `;

      await client.query(query, [taskId, tagIds]);

      logger.info('Tags removed from task successfully', { taskId, tagIds });
    } catch (error) {
      logger.error('Error removing tags from task', { error, taskId, tagIds });
      throw error;
    } finally {
      client.release();
    }
  }

  async findByTaskId(taskId: string): Promise<Tag[]> {
    const client = await this.db.connect();

    try {
      const query = `
        SELECT e.id, e.name, e.user_id
        FROM tags e
        INNER JOIN task_tags te ON e.id = te.tag_id
        WHERE te.task_id = $1
        ORDER BY e.name ASC
      `;

      const result = await client.query(query, [taskId]);

      return result.rows.map(row => new Tag(
        row.id,
        row.name,
        row.user_id
      ));
    } catch (error) {
      logger.error('Error finding tags by task ID', { error, taskId });
      throw error;
    } finally {
      client.release();
    }
  }

  async existsByNameForUser(userId: string, name: string): Promise<boolean> {
    const client = await this.db.connect();

    try {
      const query = 'SELECT 1 FROM tags WHERE name = $1 AND user_id = $2 LIMIT 1';
      const result = await client.query(query, [name, userId]);
      return result.rows.length > 0;
    } catch (error) {
      logger.error('Error checking if tag exists by name for user', {
        error,
        userId,
        name
      });
      throw error;
    } finally {
      client.release();
    }
  }

  async removeAllFromTask(taskId: string): Promise<void> {
    const client = await this.db.connect();

    try {
      const query = 'DELETE FROM task_tags WHERE task_id = $1';
      await client.query(query, [taskId]);

      logger.info('All tags removed from task successfully', { taskId });
    } catch (error) {
      logger.error('Error removing all tags from task', { error, taskId });
      throw error;
    } finally {
      client.release();
    }
  }
}
