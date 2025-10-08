import { TaskRepository } from '../../domain/repositories/task.repository';
import { ForbiddenError } from '../../shared/errors/forbidden.error';
import { NotFoundError } from '../../shared/errors/not-found.error';
import { ValidationError } from '../../shared/errors/validation.error';
import { TaskResponseDto, UpdateTaskRequestDto } from '../dto/task.dto';

export class UpdateTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepository
  ) { }

  async execute(taskId: string, dto: UpdateTaskRequestDto, userId: string): Promise<TaskResponseDto> {
    // Validar datos de entrada
    this.validateInput(dto);

    // Verificar si la task existe
    const existingTask = await this.taskRepository.findById(taskId);
    if (!existingTask) {
      throw new NotFoundError('Task');
    }

    // Verificar propiedad
    if (!existingTask.belongsToUser(userId)) {
      throw new ForbiddenError('You can only update your own tasks');
    }

    // Convertir DTO a DTO de dominio
    const updateTaskDto: any = {};

    if (dto.title !== undefined) {
      updateTaskDto.title = dto.title.trim();
    }

    if (dto.description !== undefined) {
      updateTaskDto.description = dto.description?.trim() || null;
    }

    if (dto.priority !== undefined) {
      updateTaskDto.priority = dto.priority;
    }

    if (dto.dueDate !== undefined) {
      updateTaskDto.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;

      // Validar fecha de vencimiento si se proporciona
      if (updateTaskDto.dueDate && isNaN(updateTaskDto.dueDate.getTime())) {
        throw new ValidationError('Invalid due date format', 'dueDate');
      }
    }

    if (dto.categoryId !== undefined) {
      updateTaskDto.categoryId = dto.categoryId || null;
    }

    // Actualizar task
    const updatedTask = await this.taskRepository.update(taskId, updateTaskDto);

    // Convertir a DTO de respuesta
    return this.toResponseDto(updatedTask);
  }

  private validateInput(dto: UpdateTaskRequestDto): void {
    if (dto.title !== undefined) {
      if (dto.title.trim().length === 0) {
        throw new ValidationError('Task title cannot be empty', 'title');
      }

      if (dto.title.trim().length > 255) {
        throw new ValidationError('Task title cannot exceed 255 characters', 'title');
      }
    }

    if (dto.description !== undefined && dto.description !== null && dto.description.length > 1000) {
      throw new ValidationError('Task description cannot exceed 1000 characters', 'description');
    }

    if (dto.priority !== undefined && !['baja', 'media', 'alta'].includes(dto.priority)) {
      throw new ValidationError('Priority must be baja, media, or alta', 'priority');
    }

    if (dto.dueDate !== undefined && dto.dueDate !== null) {
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
