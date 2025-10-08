import { TaskRepository } from '../../domain/repositories/task.repository';
import { ForbiddenError } from '../../shared/errors/forbidden.error';
import { NotFoundError } from '../../shared/errors/not-found.error';
import { TaskResponseDto } from '../dto/task.dto';

export class ToggleTaskCompleteUseCase {
  constructor(
    private readonly taskRepository: TaskRepository
  ) { }

  async execute(taskId: string, userId: string): Promise<TaskResponseDto> {
    // Verificar si la task existe
    const existingTask = await this.taskRepository.findById(taskId);
    if (!existingTask) {
      throw new NotFoundError('Task');
    }

    // Verificar propiedad
    if (!existingTask.belongsToUser(userId)) {
      throw new ForbiddenError('You can only modify your own tasks');
    }

    // Alternar estado de completado
    const updatedTask = await this.taskRepository.toggleComplete(taskId);

    // Convertir a DTO de respuesta
    return this.toResponseDto(updatedTask);
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
