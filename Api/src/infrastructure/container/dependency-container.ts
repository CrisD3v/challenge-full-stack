import { Pool } from 'pg';

/**
 * Contenedor de inyección de dependencias para la aplicación
 * Gestiona la creación y el ciclo de vida de todas las dependencias
 */
export class DependencyContainer {
    private static instance: DependencyContainer;

    private constructor() { }

    public static getInstance(): DependencyContainer {
        if (!DependencyContainer.instance) {
            DependencyContainer.instance = new DependencyContainer();
        }
        return DependencyContainer.instance;
    }

}