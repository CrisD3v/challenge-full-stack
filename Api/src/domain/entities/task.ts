import { Priority } from '../value-objects/priority';

export class Task {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string | null,
    public readonly completed: boolean,
    public readonly priority: Priority,
    public readonly dueDate: Date | null,
    public readonly userId: string,
    public readonly categoryId: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validateTitle(title);
    this.validateDescription(description);
    this.validateUserId(userId);
    this.validateDueDate(dueDate);
  }

  private validateTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new Error('Task title cannot be empty');
    }
    if (title.length > 255) {
      throw new Error('Task title cannot exceed 255 characters');
    }
  }

  private validateDescription(description: string | null): void {
    if (description !== null && description.length > 1000) {
      throw new Error('Task description cannot exceed 1000 characters');
    }
  }

  private validateUserId(userId: string): void {
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID cannot be empty');
    }
  }

  private validateDueDate(dueDate: Date | null): void {
    if (dueDate !== null && dueDate < new Date()) {
      // Note: This validation might be too strict for some use cases
      // In practice, you might want to allow past due dates
      // Commenting out for flexibility
      // throw new Error('Due date cannot be in the past');
    }
  }

  belongsToUser(userId: string): boolean {
    return this.userId === userId;
  }

  belongsToCategory(categoryId: string): boolean {
    return this.categoryId === categoryId;
  }

  isCompleted(): boolean {
    return this.completed;
  }

  isOverdue(): boolean {
    if (!this.dueDate || this.completed) {
      return false;
    }
    return this.dueDate < new Date();
  }

  getPriorityLevel(): string {
    return this.priority.getValue();
  }

  equals(other: Task): boolean {
    return this.id === other.id;
  }

  // Factory method to create a new task with updated completion status
  static withCompletionStatus(task: Task, completada: boolean): Task {
    return new Task(
      task.id,
      task.title,
      task.description,
      completada,
      task.priority,
      task.dueDate,
      task.userId,
      task.categoryId,
      task.createdAt,
      new Date() // Update the updatedAt timestamp
    );
  }

  // Factory method to create a new task with updates
  static withUpdates(
    task: Task,
    updates: {
      title?: string;
      description?: string | null;
      priority?: Priority;
      dueDate?: Date | null;
      categoryId?: string | null;
    }
  ): Task {
    return new Task(
      task.id,
      updates.title ?? task.title,
      updates.description !== undefined ? updates.description : task.description,
      task.completed,
      updates.priority ?? task.priority,
      updates.dueDate !== undefined ? updates.dueDate : task.dueDate,
      task.userId,
      updates.categoryId !== undefined ? updates.categoryId : task.categoryId,
      task.createdAt,
      new Date() // Update the updatedAt timestamp
    );
  }
}