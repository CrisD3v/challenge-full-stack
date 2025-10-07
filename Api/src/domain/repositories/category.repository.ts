import { Category } from '../entities/category';
import { CreateCategoryDto, UpdateCategoryDto } from './types';

export interface CategoryRepository {
    /**
     * Crea una nueva categoría
     * @param category - Datos de la categoría para creación
     * @returns Promise que resuelve a la entidad Category creada
     * @throws Error si el nombre de la categoría ya existe para el usuario
     */
    create(category: CreateCategoryDto): Promise<Category>;

    /**
     * Busca todas las categorías pertenecientes a un usuario específico
     * @param userId - ID del usuario cuyas categorías recuperar
     * @returns Promise que resuelve a un array de entidades Category
     */
    findByUserId(userId: string): Promise<Category[]>;

    /**
     * Busca una categoría por su ID único
     * @param id - ID de la categoría a buscar
     * @returns Promise que resuelve a la entidad Category o null si no se encuentra
     */
    findById(id: string): Promise<Category | null>;

    /**
     * Actualiza una categoría existente
     * @param id - ID de la categoría a actualizar
     * @param updates - Datos parciales de la categoría para actualizaciones
     * @returns Promise que resuelve a la entidad Category actualizada
     * @throws Error si la categoría no se encuentra o ocurre un conflicto de nombre
     */
    update(id: string, updates: UpdateCategoryDto): Promise<Category>;

    /**
     * Elimina una categoría por su ID
     * Esto también debe manejar la actualización de cualquier tarea que referencie esta categoría
     * @param id - ID de la categoría a eliminar
     * @returns Promise que resuelve cuando la eliminación está completa
     * @throws Error si la categoría no se encuentra
     */
    delete(id: string): Promise<void>;

    /**
     * Verifica si un nombre de categoría ya existe para un usuario específico
     * @param userId - ID del usuario
     * @param nombre - Nombre de la categoría a verificar
     * @param excludeId - ID de categoría opcional a excluir de la verificación (para actualizaciones)
     * @returns Promise que resuelve a boolean indicando existencia
     */
    existsByNameForUser(userId: string, nombre: string, excludeId?: string): Promise<boolean>;
}