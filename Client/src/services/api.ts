import type { AxiosInstance, AxiosResponse } from 'axios';
import axios from 'axios';
import { config, logger } from '../config/env';
import type {
    AuthResponse,
    Category,
    StatisticsTasks,
    Tag,
    FiltrosTareas,
    LoginData,
    OrdenTareas,
    RegisterData,
    Task,
    TaskFormData
} from '../types';

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
        const params = new URLSearchParams();

        if (filtros) {
            Object.entries(filtros).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    params.append(key, value.toString());
                }
            });
        }

        if (orden) {
            params.append('ordenarPor', orden.field);
            params.append('direccion', orden.direction);
        }

        logger.log('API Service - Obteniendo tareas con params:', params.toString());
        const response: AxiosResponse<any> = await this.api.get(`/tareas?${params}`);
        logger.log('API Service - Respuesta tareas:', response.data);

        const tareas = response.data.tasks || response.data.tareas || response.data.data || response.data || [];
        logger.log('API Service - Tareas procesadas:', tareas);

        return tareas;
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
        const response: AxiosResponse<Task> = await this.api.patch(`/tareas/${id}/toggle`);
        return response.data;
    }

    async operacionesLote(ids: string[], operacion: 'completar' | 'eliminar'): Promise<void> {
        await this.api.post('/tareas/lote', { ids, operacion });
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

    async crearCategoria(data: Omit<Category, 'id' | 'usuarioId' | 'createdAt' | 'updatedAt'>): Promise<Category> {
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

    async crearEtiqueta(data: Omit<Tag, 'id' | 'usuarioId' | 'createdAt' | 'updatedAt'>): Promise<Tag> {
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