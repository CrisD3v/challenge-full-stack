import { CreateTaskUseCase } from '../../application/use-cases/create-task.use-case';
import { DeleteTaskUseCase } from '../../application/use-cases/delete-task.use-case';
import { GetTasksUseCase } from '../../application/use-cases/get-tasks.use-case';
import { ToggleTaskCompleteUseCase } from '../../application/use-cases/toggle-task-complete.use-case';
import { UpdateTaskUseCase } from '../../application/use-cases/update-task.use-case';
import { TaskRepository } from '../../domain/repositories/task.repository';
import { TaskController } from './task.controller';

export class TaskControllerFactory {
  static create(taskRepository: TaskRepository): TaskController {
    // Crear use cases
    const createTaskUseCase = new CreateTaskUseCase(taskRepository);
    const getTasksUseCase = new GetTasksUseCase(taskRepository);
    const updateTaskUseCase = new UpdateTaskUseCase(taskRepository);
    const deleteTaskUseCase = new DeleteTaskUseCase(taskRepository);
    const toggleTaskCompleteUseCase = new ToggleTaskCompleteUseCase(taskRepository);

    // Crear y retornar controller
    return new TaskController(
      createTaskUseCase,
      getTasksUseCase,
      updateTaskUseCase,
      deleteTaskUseCase,
      toggleTaskCompleteUseCase
    );
  }
}
