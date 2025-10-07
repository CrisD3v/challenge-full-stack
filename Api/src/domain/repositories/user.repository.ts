import { User } from '../entities/user';
import { CreateUserDto } from './types';

export interface UserRepository {
    /**
     * Crea un nuevo usuario en el sistema
     * @param user - Datos del usuario para creación
     * @returns Promise que resuelve a la entidad User creada
     * @throws Error si el email ya existe o la validación falla
     */
    create(user: CreateUserDto): Promise<User>;

    /**
     * Busca un usuario por su dirección de email
     * @param email - Dirección de email a buscar
     * @returns Promise que resuelve a la entidad User o null si no se encuentra
     */
    findByEmail(email: string): Promise<User | null>;

    /**
     * Busca un usuario por su ID único
     * @param id - ID del usuario a buscar
     * @returns Promise que resuelve a la entidad User o null si no se encuentra
     */
    findById(id: string): Promise<User | null>;

    /**
     * Verifica si existe un usuario con el email dado
     * @param email - Dirección de email a verificar
     * @returns Promise que resuelve a boolean indicando existencia
     */
    existsByEmail(email: string): Promise<boolean>;
}