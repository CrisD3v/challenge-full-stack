import { TaskRepository } from '../../domain/repositories/task.repository';
import { ValidationError } from '../../shared/errors/validation.error';
import { CreateTaskRequestDto, TaskResponseDto } from '../dto/task.dto';

export class CreateTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepository
  ) { }

  async execute(dto: CreateTaskRequestDto, userId: string): Promise<TaskResponseDto> {
    // Validar datos de entrada
    this.validateInput(dto);

    // Convertir DTO a DTO de dominio
    const createTaskDto = {
      title: dto.title.trim(),
      description: dto.description?.trim() || null,
      priority: dto.priority || 'media',
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      userId: userId,
      categoryId: dto.categoryId || null
    };

    // Validar fecha de vencimiento si se proporciona
    if (createTaskDto.dueDate && isNaN(createTaskDto.dueDate.getTime())) {
      throw new ValidationError('Invalid due date format', 'dueDate');
    }

    // Crear task
    const task = await this.taskRepository.create(createTaskDto);

    // Convertir a DTO de respuesta
    return this.toResponseDto(task);
  }

  private validateInput(dto: CreateTaskRequestDto): void {
    if (!dto.title || dto.title.trim().length === 0) {
      throw new ValidationError('Task title is required', 'title');
    }

    if (dto.title.trim().length > 255) {
      throw new ValidationError('Task title cannot exceed 255 characters', 'title');
    }

    if (dto.description && dto.description.length > 1000) {
      throw new ValidationError('Task description cannot exceed 1000 characters', 'description');
    }

    if (dto.priority && !['baja', 'media', 'alta'].includes(dto.priority)) {
      throw new ValidationError('Priority must be baja, media, or alta', 'priority');
    }

    if (dto.dueDate) {
      const dueDate = new Date(dto.dueDate);
      if (isNaN(dueDate.getTime())) {
        throw new ValidationError('Invalid due date format', 'dueDate');
      }
    }
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
