import { TaskRepository } from '../../domain/repositories/task.repository';
import { ForbiddenError } from '../../shared/errors/forbidden.error';
import { NotFoundError } from '../../shared/errors/not-found.error';

export class DeleteTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepository
  ) { }

  async execute(taskId: string, userId: string): Promise<void> {
    // Verificar si la task existe
    const existingTask = await this.taskRepository.findById(taskId);
    if (!existingTask) {
      throw new NotFoundError('Task');
    }

    // Verificar propiedad
    if (!existingTask.belongsToUser(userId)) {
      throw new ForbiddenError('You can only delete your own tasks');
    }

    // Eliminar task
    await this.taskRepository.delete(taskId);
  }
}
