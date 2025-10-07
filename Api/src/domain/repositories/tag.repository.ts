import { Tag } from '../entities/tag';
import { CreateTagDto } from './types';

export interface TagRepository {
    /**
     * Crea un nuevo tag
     * @param tag - Datos del tag para creación
     * @returns Promise que resuelve a la entidad Tag creada
     * @throws Error si el nombre del tag ya existe para el usuario
     */
    create(tag: CreateTagDto): Promise<Tag>;

    /**
     * Busca todos los tags pertenecientes a un usuario específico
     * @param userId - ID del usuario cuyos tags recuperar
     * @returns Promise que resuelve a un array de entidades Tag
     */
    findByUserId(userId: string): Promise<Tag[]>;

    /**
     * Busca un tag por su ID único
     * @param id - ID del tag a buscar
     * @returns Promise que resuelve a la entidad Tag o null si no se encuentra
     */
    findById(id: string): Promise<Tag | null>;

    /**
     * Busca tags por sus IDs
     * @param ids - Array de IDs de tags a buscar
     * @returns Promise que resuelve a un array de entidades Tag
     */
    findByIds(ids: string[]): Promise<Tag[]>;

    /**
     * Agrega tags a una tarea (crea relaciones task-tag)
     * @param taskId - ID de la tarea
     * @param tagIds - Array de IDs de tags a asociar con la tarea
     * @returns Promise que resuelve cuando las asociaciones son creadas
     * @throws Error si la tarea o algún tag no se encuentra
     */
    addToTask(taskId: string, tagIds: string[]): Promise<void>;

    /**
     * Remueve tags de una tarea (elimina relaciones task-tag)
     * @param taskId - ID de la tarea
     * @param tagIds - Array de IDs de tags a remover de la tarea
     * @returns Promise que resuelve cuando las asociaciones son removidas
     */
    removeFromTask(taskId: string, tagIds: string[]): Promise<void>;

    /**
     * Obtiene todos los tags asociados con una tarea específica
     * @param taskId - ID de la tarea
     * @returns Promise que resuelve a un array de entidades Tag
     */
    findByTaskId(taskId: string): Promise<Tag[]>;

    /**
     * Verifica si un nombre de tag ya existe para un usuario específico
     * @param userId - ID del usuario
     * @param nombre - Nombre del tag a verificar
     * @returns Promise que resuelve a boolean indicando existencia
     */
    existsByNameForUser(userId: string, nombre: string): Promise<boolean>;

    /**
     * Remueve todas las asociaciones de tags para una tarea específica
     * Esto es útil cuando se elimina una tarea
     * @param taskId - ID de la tarea
     * @returns Promise que resuelve cuando todas las asociaciones son removidas
     */
    removeAllFromTask(taskId: string): Promise<void>;
}