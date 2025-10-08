import { TaskRepository } from '../../domain/repositories/task.repository';
import { TaskFilters } from '../../domain/repositories/types';
import { ValidationError } from '../../shared/errors/validation.error';
import { GetTasksResponseDto, TaskFiltersDto, TaskResponseDto } from '../dto/task.dto';

export class GetTasksUseCase {
  constructor(
    private readonly taskRepository: TaskRepository
  ) { }

  async execute(userId: string, filtersDto?: TaskFiltersDto): Promise<GetTasksResponseDto> {
    // Validar y convertir filtros
    const filters = this.convertFilters(filtersDto);

    // Obtener tasks y conteo total
    const [tasks, total] = await Promise.all([
      this.taskRepository.findByUserId(userId, filters),
      this.taskRepository.countByUserId(userId, this.getCountFilters(filters))
    ]);

    // Convertir a DTOs de respuesta
    const taskDtos = tasks.map(task => this.toResponseDto(task));

    return {
      tasks: taskDtos,
      total,
      limit: filters.limit || 50,
      offset: filters.offset || 0
    };
  }

  private convertFilters(filtersDto?: TaskFiltersDto): TaskFilters {
    if (!filtersDto) {
      return {
        limit: 50,
        offset: 0
      };
    }

    const filters: TaskFilters = {};

    // Copiar filtros simples
    if (filtersDto.completed !== undefined) {
      filters.completed = filtersDto.completed;
    }

    if (filtersDto.category) {
      filters.category = filtersDto.category;
    }

    if (filtersDto.priority) {
      this.validatePriority(filtersDto.priority);
      filters.priority = filtersDto.priority;
    }

    if (filtersDto.search) {
      filters.search = filtersDto.search.trim();
    }

    if (filtersDto.tags && filtersDto.tags.length > 0) {
      filters.tags = filtersDto.tags;
    }

    // Convertir filtros de fecha
    if (filtersDto.dueDate) {
      filters.dueDate = {};

      if (filtersDto.dueDate.since) {
        const since = new Date(filtersDto.dueDate.since);
        if (isNaN(since.getTime())) {
          throw new ValidationError('Invalid start date format', 'dueDate.since');
        }
        filters.dueDate.since = since;
      }

      if (filtersDto.dueDate.until) {
        const until = new Date(filtersDto.dueDate.until);
        if (isNaN(until.getTime())) {
          throw new ValidationError('Invalid end date format', 'dueDate.until');
        }
        filters.dueDate.until = until;
      }
    }

    // Validar y establecer ordenamiento
    if (filtersDto.order) {
      this.validateSortField(filtersDto.order);
      filters.order = filtersDto.order;
    }

    if (filtersDto.direction) {
      this.validateSortDirection(filtersDto.direction);
      filters.direction = filtersDto.direction;
    }

    // Establecer paginación con valores por defecto y validación
    filters.limit = this.validateLimit(filtersDto.limit);
    filters.offset = this.validateOffset(filtersDto.offset);

    return filters;
  }

  private getCountFilters(filters: TaskFilters): Omit<TaskFilters, 'limit' | 'offset' | 'order' | 'direction'> {
    const countFilters = { ...filters };
    delete countFilters.limit;
    delete countFilters.offset;
    delete countFilters.order;
    delete countFilters.direction;
    return countFilters;
  }

  private validatePriority(priority: string): void {
    if (!['baja', 'media', 'alta'].includes(priority)) {
      throw new ValidationError('Priority must be baja, media, or alta', 'priority');
    }
  }

  private validateSortField(order: string): void {
    const validFields = ['created_at', 'due_date', 'priority', 'title'];
    if (!validFields.includes(order)) {
      throw new ValidationError(`Sort field must be one of: ${validFields.join(', ')}`, 'order');
    }
  }

  private validateSortDirection(direction: string): void {
    if (!['asc', 'desc'].includes(direction)) {
      throw new ValidationError('Sort direction must be asc or desc', 'direction');
    }
  }

  private validateLimit(limit?: number): number {
    if (limit === undefined) {
      return 50; // Límite por defecto
    }

    if (limit < 1) {
      throw new ValidationError('Limit must be at least 1', 'limit');
    }

    if (limit > 100) {
      throw new ValidationError('Limit cannot exceed 100', 'limit');
    }

    return limit;
  }

  private validateOffset(offset?: number): number {
    if (offset === undefined) {
      return 0; // Offset por defecto
    }

    if (offset < 0) {
      throw new ValidationError('Offset cannot be negative', 'offset');
    }

    return offset;
  }

  private toResponseDto(task: any): TaskResponseDto {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      priority: task.priority.getValue(),
      dueDate: task.dueDate,
      userId: task.userId,
      categoryId: task.categoryId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    };
  }
}
