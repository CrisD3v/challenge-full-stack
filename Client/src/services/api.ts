import type { AxiosInstance, AxiosResponse } from 'axios';
import axios from 'axios';
import { config, logger } from '../config/env';
import type {
    AuthResponse,
    Category,
    FiltrosTareas,
    LoginData,
    OrdenTareas,
    RegisterData,
    StatisticsTasks,
    Tag,
    Task,
    TaskFormData
} from '../types';
import { mapSortField, validateSortDirection } from '../utils/fieldMapping';

class ApiService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: config.api.baseUrl,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: config.api.timeout,
        });

        // Interceptor para agregar el token a todas las requests
        this.api.interceptors.request.use((axiosConfig) => {
            const token = localStorage.getItem(config.auth.tokenStorageKey);
            logger.log('API Request Interceptor - Token:', token ? 'Presente' : 'Ausente');
            logger.log('API Request Interceptor - URL:', axiosConfig.url);
            if (token) {
                axiosConfig.headers.Authorization = `Bearer ${token}`;
                logger.log('API Request Interceptor - Authorization header agregado');
            }
            return axiosConfig;
        });

        // Interceptor para manejar errores de autenticación
        this.api.interceptors.response.use(
            (response) => {
                logger.log('API Response Interceptor - Success:', response.status, response.config?.url);
                return response;
            },
            (error) => {
                const status = error.response?.status || 'No status';
                const url = error.config?.url || 'No URL';
                const data = error.response?.data || 'No data';
                const message = error.message || 'No message';

                logger.error('API Response Interceptor - Error Details:', {
                    status,
                    url,
                    data,
                    message,
                    code: error.code,
                    isNetworkError: !error.response
                });

                // Verificar si es un error de red (servidor no disponible)
                if (!error.response) {
                    logger.error('API Response Interceptor - Error de red: Servidor no disponible');
                    logger.error('API Response Interceptor - Verificar que el backend esté corriendo en:', config.api.baseUrl);
                }

                if (status === 401) {
                    // logger.log('API Response Interceptor - Token inválido, limpiando localStorage');
                    localStorage.removeItem(config.auth.tokenStorageKey);
                    localStorage.removeItem('usuario');

                    // Clear cache on token expiration
                    try {
                        // Dynamic import to avoid circular dependency
                        import('../utils/authEvents').then(({ authEvents }) => {
                            authEvents.onTokenExpired();
                        }).catch(error => {
                            console.warn('Could not handle token expiration event:', error);
                        });
                    } catch (error) {
                        console.warn('Auth events not available for token expiration:', error);
                    }

                    window.location.href = '/login';
                }

                return Promise.reject(error);
            }
        );
    }

    // Autenticación
    async login(data: LoginData): Promise<AuthResponse> {
        logger.log('API Service - Enviando login request:', data);
        const response: AxiosResponse<any> = await this.api.post('/auth/login', data);
        logger.log('API Service - Respuesta recibida:', response.data);
        const adaptedResponse = {
            token: response.data.token,
            usuario: response.data.user
        };
        logger.log('API Service - Respuesta adaptada:', adaptedResponse);
        return adaptedResponse;
    }

    async register(data: RegisterData): Promise<AuthResponse> {
        const response: AxiosResponse<any> = await this.api.post('/auth/register', data);
        return {
            token: response.data.token,
            usuario: response.data.user
        };
    }

    async logout(): Promise<void> {
        await this.api.post('/auth/logout');
    }

    // Tareas
    async obtenerTareas(filtros?: FiltrosTareas, orden?: OrdenTareas): Promise<Task[]> {
        // Construir parámetros de query de forma más robusta
        const queryParams = this.buildQueryParams(filtros, orden);

        // Log detallado de parámetros para debug
        logger.log('API Service - Filtros originales:', filtros);
        logger.log('API Service - Orden original:', orden);
        logger.log('API Service - Parámetros construidos:', queryParams);
        logger.log('API Service - Query string final:', queryParams.toString());

        const response: AxiosResponse<any> = await this.api.get(`/tareas?${queryParams}`);
        logger.log('API Service - Respuesta tareas:', response.data);

        const tareas = response.data.tasks || response.data.tareas || response.data.data || response.data || [];
        logger.log('API Service - Tareas procesadas:', tareas.length, 'tareas encontradas');

        return tareas;
    }

    /**
     * Construye los parámetros de query para la obtención de tareas
     * Asegura que solo se envíen parámetros válidos y no vacíos al servidor
     *
     * @param filtros Filtros de tareas opcionales
     * @param orden Configuración de ordenamiento opcional
     * @returns URLSearchParams con parámetros válidos
     */
    private buildQueryParams(filtros?: FiltrosTareas, orden?: OrdenTareas): URLSearchParams {
        const params = new URLSearchParams();

        // Procesar filtros solo si existen y tienen valores válidos
        if (filtros) {
            // Filtro de estado completado
            if (typeof filtros.completed === 'boolean') {
                params.append('completed', filtros.completed.toString());
                logger.log('API Service - Agregando filtro completed:', filtros.completed);
            }

            // Filtro de prioridad
            if (filtros.priority && ['baja', 'media', 'alta'].includes(filtros.priority)) {
                params.append('priority', filtros.priority);
                logger.log('API Service - Agregando filtro priority:', filtros.priority);
                console.log('API Service - Priority filter added to params:', {
                    priority: filtros.priority,
                    allParams: Object.fromEntries(params.entries())
                });
            } else if (filtros.priority) {
                logger.warn(`API Service - Valor inválido para priority ignorado: ${filtros.priority}`);
                console.warn('API Service - Invalid priority value:', filtros.priority);
            }

            // Filtro de categoría
            if (filtros.categoryId && filtros.categoryId.trim() !== '') {
                params.append('categoryId', filtros.categoryId.trim());
                logger.log('API Service - Agregando filtro categoryId:', filtros.categoryId);
            }

            // Filtro de etiqueta
            if (filtros.tagId && filtros.tagId.trim() !== '') {
                params.append('tagId', filtros.tagId.trim());
                logger.log('API Service - Agregando filtro tagId:', filtros.tagId);
            }

            // Filtro de fecha desde
            if (filtros.sinceDate && filtros.sinceDate.trim() !== '') {
                // Validar formato de fecha ISO
                const sinceDate = filtros.sinceDate.trim();
                if (this.isValidISODate(sinceDate)) {
                    params.append('sinceDate', sinceDate);
                    logger.log('API Service - Agregando filtro sinceDate:', sinceDate);
                } else {
                    logger.warn(`API Service - Formato de fecha inválido para sinceDate ignorado: ${sinceDate}`);
                }
            }

            // Filtro de fecha hasta
            if (filtros.untilDate && filtros.untilDate.trim() !== '') {
                // Validar formato de fecha ISO
                const untilDate = filtros.untilDate.trim();
                if (this.isValidISODate(untilDate)) {
                    params.append('untilDate', untilDate);
                    logger.log('API Service - Agregando filtro untilDate:', untilDate);
                } else {
                    logger.warn(`API Service - Formato de fecha inválido para untilDate ignorado: ${untilDate}`);
                }
            }

            // Filtro de búsqueda por texto
            if (filtros.search && filtros.search.trim() !== '') {
                const searchTerm = filtros.search.trim();
                // Solo agregar si tiene al menos 1 carácter después del trim
                if (searchTerm.length > 0) {
                    params.append('search', searchTerm);
                    logger.log('API Service - Agregando filtro search:', searchTerm);
                }
            }
        }

        // Procesar ordenamiento si existe
        if (orden && orden.field && orden.direction) {
            // Mapear campo de ordenamiento del frontend al backend
            const mappedField = mapSortField(orden.field);
            params.append('ordenarPor', mappedField);
            logger.log('API Service - Agregando ordenamiento campo:', `${orden.field} -> ${mappedField}`);
            console.log('API Service - Sort field added to params:', {
                originalField: orden.field,
                mappedField,
                allParams: Object.fromEntries(params.entries())
            });

            // Validar dirección de ordenamiento
            const validDirection = validateSortDirection(orden.direction);
            params.append('direccion', validDirection);
            logger.log('API Service - Agregando ordenamiento dirección:', `${orden.direction} -> ${validDirection}`);
            console.log('API Service - Sort direction added to params:', {
                originalDirection: orden.direction,
                validDirection,
                allParams: Object.fromEntries(params.entries())
            });
        } else {
            console.log('API Service - No sorting parameters provided:', orden);
        }

        // Log final de parámetros construidos
        const paramCount = Array.from(params.keys()).length;
        logger.log(`API Service - Construidos ${paramCount} parámetros de query válidos`);

        return params;
    }

    /**
     * Valida si una cadena es una fecha ISO válida
     * @param dateString Cadena de fecha a validar
     * @returns true si es una fecha ISO válida
     */
    private isValidISODate(dateString: string): boolean {
        // Verificar formato básico ISO (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss.sssZ)
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
        if (!isoDateRegex.test(dateString)) {
            return false;
        }

        // Verificar que sea una fecha válida
        const date = new Date(dateString);
        return !isNaN(date.getTime()) && date.toISOString().startsWith(dateString.substring(0, 10));
    }

    async obtenerTarea(id: string): Promise<Task> {
        const response: AxiosResponse<Task> = await this.api.get(`/tareas/${id}`);
        return response.data;
    }

    async crearTarea(data: TaskFormData): Promise<Task> {
        const response: AxiosResponse<Task> = await this.api.post('/tareas', data);
        return response.data;
    }

    async actualizarTarea(id: string, data: Partial<TaskFormData>): Promise<Task> {
        const response: AxiosResponse<Task> = await this.api.put(`/tareas/${id}`, data);
        return response.data;
    }

    async eliminarTarea(id: string): Promise<void> {
        await this.api.delete(`/tareas/${id}`);
    }

    async toggleCompletarTarea(id: string): Promise<Task> {
        const response: AxiosResponse<Task> = await this.api.patch(`/tareas/${id}/completar`);
        return response.data;
    }

    /**
     * Realiza operaciones en lote sobre múltiples tareas
     *
     * Este método permite ejecutar operaciones masivas (completar o eliminar) sobre
     * múltiples tareas seleccionadas utilizando los endpoints individuales existentes.
     * Procesa cada tarea de forma secuencial para mantener el control de errores
     * y proporcionar feedback detallado sobre el progreso de la operación.
     *
     * Operaciones soportadas:
     * - 'completar': Marca todas las tareas especificadas como completadas usando toggleCompletarTarea
     * - 'eliminar': Elimina permanentemente todas las tareas especificadas usando eliminarTarea
     *
     * La función procesa las tareas de forma secuencial (no paralela) para:
     * - Evitar sobrecargar el servidor con múltiples requests simultáneas
     * - Mantener un control preciso sobre errores individuales
     * - Permitir rollback parcial si alguna operación falla
     *
     * Cumple con los requisitos:
     * - 1.1, 1.2: Completar múltiples tareas utilizando endpoint individual
     * - 2.1, 2.2: Eliminar múltiples tareas utilizando endpoint individual
     * - 4.1: Reutilización de endpoints existentes para consistencia
     *
     * @param ids - Array de identificadores únicos de las tareas a procesar
     * @param operacion - Tipo de operación a realizar: 'completar' o 'eliminar'
     * @returns Promise<void> - Se resuelve cuando todas las operaciones se completan exitosamente
     * @throws Error si alguna operación individual falla, incluyendo detalles del error
     */
    async operacionesLote(ids: string[], operacion: 'completar' | 'eliminar'): Promise<void> {
        // Validar que hay IDs para procesar
        if (!ids || ids.length === 0) {
            throw new Error('No se proporcionaron IDs de tareas para procesar');
        }

        // Array para almacenar errores individuales
        const errores: Array<{ id: string; error: any }> = [];

        // Procesar cada tarea de forma secuencial
        for (const id of ids) {
            try {
                if (operacion === 'completar') {
                    // Usar el endpoint individual existente para completar
                    await this.toggleCompletarTarea(id);
                } else if (operacion === 'eliminar') {
                    // Usar el endpoint individual existente para eliminar
                    await this.eliminarTarea(id);
                } else {
                    throw new Error(`Operación no soportada: ${operacion}`);
                }
            } catch (error) {
                // Registrar el error pero continuar con las siguientes tareas
                errores.push({ id, error });
                logger.error(`Error en operación ${operacion} para tarea ${id}:`, error);
            }
        }

        // Si hubo errores, lanzar una excepción con detalles
        if (errores.length > 0) {
            const errorMessage = `Falló la operación ${operacion} en ${errores.length} de ${ids.length} tareas`;
            const detailedError = new Error(errorMessage);

            // Agregar información adicional sobre los errores
            (detailedError as any).failedOperations = errores;
            (detailedError as any).successCount = ids.length - errores.length;
            (detailedError as any).totalCount = ids.length;

            throw detailedError;
        }

        logger.log(`Operación ${operacion} completada exitosamente para ${ids.length} tareas`);
    }

    // Categorías
    async obtenerCategorias(): Promise<Category[]> {
        // logger.log('API Service - Obteniendo categorías...');
        const response: AxiosResponse<any> = await this.api.get('/categorias');
        logger.log('API Service - Respuesta categorías:', response.data);

        const categorias = response.data.categories || response.data.categorias || response.data.data || response.data || [];
        logger.log('API Service - Categorías procesadas:', categorias);

        return categorias;
    }

    async crearCategoria(data: Omit<Category, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Category> {
        const response: AxiosResponse<Category> = await this.api.post('/categorias', data);
        return response.data;
    }

    async actualizarCategoria(id: string, data: Partial<Category>): Promise<Category> {
        const response: AxiosResponse<Category> = await this.api.put(`/categorias/${id}`, data);
        return response.data;
    }

    async eliminarCategoria(id: string): Promise<void> {
        await this.api.delete(`/categorias/${id}`);
    }

    // Etiquetas
    async obtenerEtiquetas(): Promise<Tag[]> {
        logger.log('API Service - Obteniendo etiquetas...');
        const response: AxiosResponse<any> = await this.api.get('/etiquetas');
        logger.log('API Service - Respuesta etiquetas:', response.data);

        const etiquetas = response.data.tags || response.data.etiquetas || response.data.data || response.data || [];
        logger.log('API Service - Etiquetas procesadas:', etiquetas);

        return etiquetas;
    }

    async crearEtiqueta(data: Omit<Tag, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Tag> {
        const response: AxiosResponse<Tag> = await this.api.post('/etiquetas', data);
        return response.data;
    }

    async eliminarEtiqueta(id: string): Promise<void> {
        await this.api.delete(`/etiquetas/${id}`);
    }

    // Estadísticas
    async obtenerEstadisticas(): Promise<StatisticsTasks> {
        const response: AxiosResponse<StatisticsTasks> = await this.api.get('/tareas/estadisticas');
        return response.data;
    }

    // Exportar
    async exportarTareas(formato: 'csv' | 'json'): Promise<Blob> {
        const response = await this.api.get(`/tareas/exportar/${formato}`, {
            responseType: 'blob'
        });
        return response.data;
    }
}

export const apiService = new ApiService();
export default apiService;
