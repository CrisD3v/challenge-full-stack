import { Task } from '../entities/task';
import { CreateTaskDto, TaskFilters, UpdateTaskDto } from './types';

export interface TaskRepository {
    /**
     * Crea una nueva tarea
     * @param task - Datos de la tarea para creación
     * @returns Promise que resuelve a la entidad Task creada
     */
    create(task: CreateTaskDto): Promise<Task>;

    /**
     * Busca tareas pertenecientes a un usuario específico con filtrado opcional
     * @param userId - ID del usuario cuyas tareas recuperar
     * @param filters - Filtros opcionales para búsqueda, ordenamiento y paginación
     * @returns Promise que resuelve a un array de entidades Task
     */
    findByUserId(userId: string, filters?: TaskFilters): Promise<Task[]>;

    /**
     * Busca una tarea por su ID único
     * @param id - ID de la tarea a buscar
     * @returns Promise que resuelve a la entidad Task o null si no se encuentra
     */
    findById(id: string): Promise<Task | null>;

    /**
     * Actualiza una tarea existente
     * @param id - ID de la tarea a actualizar
     * @param updates - Datos parciales de la tarea para actualizaciones
     * @returns Promise que resuelve a la entidad Task actualizada
     * @throws Error si la tarea no se encuentra
     */
    update(id: string, updates: UpdateTaskDto): Promise<Task>;

    /**
     * Elimina una tarea por su ID
     * @param id - ID de la tarea a eliminar
     * @returns Promise que resuelve cuando la eliminación está completa
     * @throws Error si la tarea no se encuentra
     */
    delete(id: string): Promise<void>;

    /**
     * Alterna el estado de completado de una tarea
     * @param id - ID de la tarea a alternar
     * @returns Promise que resuelve a la entidad Task actualizada
     * @throws Error si la tarea no se encuentra
     */
    toggleComplete(id: string): Promise<Task>;

    /**
     * Cuenta el total de tareas para un usuario con filtros opcionales
     * @param userId - ID del usuario cuyas tareas contar
     * @param filters - Filtros opcionales a aplicar al conteo
     * @returns Promise que resuelve al conteo total
     */
    countByUserId(userId: string, filters?: Omit<TaskFilters, 'limit' | 'offset' | 'ordenar' | 'direccion'>): Promise<number>;
}