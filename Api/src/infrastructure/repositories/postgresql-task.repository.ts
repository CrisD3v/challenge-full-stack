import { Pool } from 'pg';
import { Task } from '../../domain/entities/task';
import { TaskRepository } from '../../domain/repositories/task.repository';
import { CreateTaskDto, TaskFilters, UpdateTaskDto } from '../../domain/repositories/types';
import { Priority } from '../../domain/value-objects/priority';
import { NotFoundError } from '../../shared/errors/not-found.error';
import { logger } from '../logging/logger';

export class PostgreSQLTaskRepository implements TaskRepository {
  constructor(private readonly db: Pool) { }

  async create(task: CreateTaskDto): Promise<Task> {
    const client = await this.db.connect();

    try {
      const insertQuery = `
        INSERT INTO tasks (title, description, priority, due_date, user_id, category_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, title, description, completed, priority, due_date,
                  user_id, category_id, created_at, updated_at
      `;

      const result = await client.query(insertQuery, [
        task.title,
        task.description || null,
        task.priority || 'media',
        task.dueDate || null,
        task.userId,
        task.categoryId || null
      ]);

      const row = result.rows[0];

      logger.info('Task created successfully', {
        taskId: row.id,
        userId: row.user_id
      });

      return new Task(
        row.id,
        row.title,
        row.description,
        row.completed,
        new Priority(row.priority),
        row.due_date,
        row.user_id,
        row.category_id,
        row.created_at,
        row.updated_at
      );
    } catch (error) {
      logger.error('Error creating task', { error, task });
      throw error;
    } finally {
      client.release();
    }
  }

  async findByUserId(userId: string, filters?: TaskFilters): Promise<Task[]> {
    const client = await this.db.connect();

    try {
      let query = `
        SELECT t.id, t.title, t.description, t.completed, t.priority,
               t.due_date, t.user_id, t.category_id,
               t.created_at, t.updated_at
        FROM tasks t
        WHERE t.user_id = $1
      `;

      const params: any[] = [userId];
      let paramIndex = 2;

      // Apply filters
      if (filters) {
        if (filters.completed !== undefined) {
          query += ` AND t.completed = $${paramIndex}`;
          params.push(filters.completed);
          paramIndex++;
        }

        if (filters.category) {
          query += ` AND t.category_id = $${paramIndex}`;
          params.push(filters.category);
          paramIndex++;
        }

        if (filters.priority) {
          query += ` AND t.priority = $${paramIndex}`;
          params.push(filters.priority);
          paramIndex++;
        }

        if (filters.dueDate) {
          if (filters.dueDate.since) {
            query += ` AND t.due_date >= $${paramIndex}`;
            params.push(filters.dueDate.since);
            paramIndex++;
          }
          if (filters.dueDate.until) {
            query += ` AND t.due_date <= $${paramIndex}`;
            params.push(filters.dueDate.until);
            paramIndex++;
          }
        }

        if (filters.search) {
          query += ` AND (t.title ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex})`;
          params.push(`%${filters.search}%`);
          paramIndex++;
        }

        if (filters.tags && filters.tags.length > 0) {
          query += `
            AND t.id IN (
              SELECT te.task_id
              FROM task_tags te
              JOIN tags e ON te.tag_id = e.id
              WHERE e.id = ANY($${paramIndex})
            )
          `;
          params.push(filters.tags);
          paramIndex++;
        }

        // Apply sorting
        if (filters.order) {
          const sortColumn = this.mapSortColumn(filters.order);
          const direction = filters.direction === 'desc' ? 'DESC' : 'ASC';
          query += ` ORDER BY ${sortColumn} ${direction}`;
        } else {
          query += ' ORDER BY t.created_at DESC';
        }

        // Apply pagination
        if (filters.limit) {
          query += ` LIMIT $${paramIndex}`;
          params.push(filters.limit);
          paramIndex++;
        }

        if (filters.offset) {
          query += ` OFFSET $${paramIndex}`;
          params.push(filters.offset);
          paramIndex++;
        }
      } else {
        query += ' ORDER BY t.created_at DESC';
      }

      const result = await client.query(query, params);

      return result.rows.map(row => new Task(
        row.id,
        row.title,
        row.description,
        row.completed,
        new Priority(row.priority),
        row.due_date,
        row.user_id,
        row.category_id,
        row.created_at,
        row.updated_at
      ));
    } catch (error) {
      logger.error('Error finding tasks by user ID', { error, userId, filters });
      throw error;
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<Task | null> {
    const client = await this.db.connect();

    try {
      const query = `
        SELECT id, title, description, completed, priority, due_date,
               user_id, category_id, created_at, updated_at
        FROM tasks
        WHERE id = $1
      `;

      const result = await client.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return new Task(
        row.id,
        row.title,
        row.description,
        row.completed,
        new Priority(row.priority),
        row.due_date,
        row.user_id,
        row.category_id,
        row.created_at,
        row.updated_at
      );
    } catch (error) {
      logger.error('Error finding task by ID', { error, taskId: id });
      throw error;
    } finally {
      client.release();
    }
  }

  async update(id: string, updates: UpdateTaskDto): Promise<Task> {
    const client = await this.db.connect();

    try {
      // First check if task exists
      const existingTask = await this.findById(id);
      if (!existingTask) {
        throw new NotFoundError('Task not found');
      }

      const updateFields: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (updates.title !== undefined) {
        updateFields.push(`title = $${paramIndex}`);
        params.push(updates.title);
        paramIndex++;
      }

      if (updates.description !== undefined) {
        updateFields.push(`description = $${paramIndex}`);
        params.push(updates.description);
        paramIndex++;
      }

      if (updates.priority !== undefined) {
        updateFields.push(`priority = $${paramIndex}`);
        params.push(updates.priority);
        paramIndex++;
      }

      if (updates.dueDate !== undefined) {
        updateFields.push(`due_date = $${paramIndex}`);
        params.push(updates.dueDate);
        paramIndex++;
      }

      if (updates.categoryId !== undefined) {
        updateFields.push(`category_id = $${paramIndex}`);
        params.push(updates.categoryId);
        paramIndex++;
      }

      if (updateFields.length === 0) {
        return existingTask;
      }

      updateFields.push(`updated_at = $${paramIndex}`);
      params.push(new Date());
      paramIndex++;

      params.push(id);

      const query = `
        UPDATE tasks
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, title, description, completed, priority, due_date,
                  user_id, category_id, created_at, updated_at
      `;

      const result = await client.query(query, params);
      const row = result.rows[0];

      logger.info('Task updated successfully', { taskId: id });

      return new Task(
        row.id,
        row.title,
        row.description,
        row.completed,
        new Priority(row.priority),
        row.due_date,
        row.user_id,
        row.category_id,
        row.created_at,
        row.updated_at
      );
    } catch (error) {
      logger.error('Error updating task', { error, taskId: id, updates });
      throw error;
    } finally {
      client.release();
    }
  }

  async delete(id: string): Promise<void> {
    const client = await this.db.connect();

    try {
      // First remove all tag associations
      await client.query('DELETE FROM tarea_etiquetas WHERE tarea_id = $1', [id]);

      // Then delete the task
      const result = await client.query('DELETE FROM tasks WHERE id = $1', [id]);

      if (result.rowCount === 0) {
        throw new NotFoundError('Task not found');
      }

      logger.info('Task deleted successfully', { taskId: id });
    } catch (error) {
      logger.error('Error deleting task', { error, taskId: id });
      throw error;
    } finally {
      client.release();
    }
  }

  async toggleComplete(id: string): Promise<Task> {
    const client = await this.db.connect();

    try {
      const query = `
        UPDATE tasks
        SET completed = NOT completed, updated_at = $1
        WHERE id = $2
        RETURNING id, title, description, completed, priority, due_date,
                  user_id, category_id, created_at, updated_at
      `;

      const result = await client.query(query, [new Date(), id]);

      if (result.rows.length === 0) {
        throw new NotFoundError('Task not found');
      }

      const row = result.rows[0];

      logger.info('Task completion status toggled', {
        taskId: id,
        completed: row.completed
      });

      return new Task(
        row.id,
        row.title,
        row.description,
        row.completed,
        new Priority(row.priority),
        row.due_date,
        row.user_id,
        row.category_id,
        row.created_at,
        row.updated_at
      );
    } catch (error) {
      logger.error('Error toggling task completion', { error, taskId: id });
      throw error;
    } finally {
      client.release();
    }
  }

  async countByUserId(userId: string, filters?: Omit<TaskFilters, 'limit' | 'offset' | 'ordenar' | 'direccion'>): Promise<number> {
    const client = await this.db.connect();

    try {
      let query = 'SELECT COUNT(*) FROM tasks t WHERE t.user_id = $1';
      const params: any[] = [userId];
      let paramIndex = 2;

      // Apply the same filters as in findByUserId, but without sorting and pagination
      if (filters) {
        if (filters.completed !== undefined) {
          query += ` AND t.completed = $${paramIndex}`;
          params.push(filters.completed);
          paramIndex++;
        }

        if (filters.category) {
          query += ` AND t.category_id = $${paramIndex}`;
          params.push(filters.category);
          paramIndex++;
        }

        if (filters.priority) {
          query += ` AND t.priority = $${paramIndex}`;
          params.push(filters.priority);
          paramIndex++;
        }

        if (filters.dueDate) {
          if (filters.dueDate.since) {
            query += ` AND t.due_date >= $${paramIndex}`;
            params.push(filters.dueDate.since);
            paramIndex++;
          }
          if (filters.dueDate.until) {
            query += ` AND t.due_date <= $${paramIndex}`;
            params.push(filters.dueDate.until);
            paramIndex++;
          }
        }

        if (filters.search) {
          query += ` AND (t.title ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex})`;
          params.push(`%${filters.search}%`);
          paramIndex++;
        }

        if (filters.tags && filters.tags.length > 0) {
          query += `
            AND t.id IN (
              SELECT te.task_id
              FROM task_tags te
              JOIN etiquetas e ON te.tag_id = e.id
              WHERE e.id = ANY($${paramIndex})
            )
          `;
          params.push(filters.tags);
          paramIndex++;
        }
      }

      const result = await client.query(query, params);
      return parseInt(result.rows[0].count);
    } catch (error) {
      logger.error('Error counting tasks by user ID', { error, userId, filters });
      throw error;
    } finally {
      client.release();
    }
  }

  private mapSortColumn(ordenar: string): string {
    const columnMap: Record<string, string> = {
      'creado_en': 't.created_at',
      'due_date': 't.due_date',
      'priority': 't.priority',
      'title': 't.title'
    };

    return columnMap[ordenar] || 't.created_at';
  }
}
