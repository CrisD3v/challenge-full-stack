import { Router } from 'express';
import { DependencyContainer } from '../../infrastructure/container/dependency-container';
import { createAuthMiddleware } from '../../infrastructure/middleware/auth.middleware';
import { checkReadiness, getDetailedHealthStatus, getHealthStatus } from '../../infrastructure/monitoring/health-service';
import { authRateLimit, generalRateLimit } from '../middleware/rate-limit.middleware';
import { createAuthRoutes } from './auth.routes';
import { createCategoryRoutes } from './category.routes';
import { createTagRoutes } from './tag.routes';
import { createTaskRoutes } from './task.routes';

/**
 * Configuración principal del router que establece todas las rutas de la API
 * Configura todos los endpoints con middleware apropiado y limitación de velocidad
 */
export const createApiRoutes = (container: DependencyContainer): Router => {
    const router = Router();

    // Obtener servicios del contenedor
    const jwtService = container.getJWTService();
    const authController = container.getAuthController();
    const taskController = container.getTaskController();
    const categoryController = container.getCategoryController();
    const tagController = container.getTagController();
    const taskRepository = container.getTaskRepository();

    // Crear instancias de middleware
    const authMiddleware = createAuthMiddleware(jwtService);

    // Rutas de autenticación con limitación de velocidad más estricta
    // /api/auth/*
    router.use('/auth', authRateLimit, createAuthRoutes(authController, authMiddleware));

    // Rutas de gestión de tareas con limitación de velocidad general
    // /api/tareas/*
    router.use('/tareas', generalRateLimit, createTaskRoutes(taskController, jwtService, taskRepository));

    // Rutas de gestión de categorías con limitación de velocidad general
    // /api/categorias/*
    router.use('/categorias', generalRateLimit, createCategoryRoutes(categoryController, jwtService));

    // Rutas de gestión de etiquetas con limitación de velocidad general
    // /api/etiquetas/*
    router.use('/etiquetas', generalRateLimit, createTagRoutes(tagController, jwtService));

    return router;
};

/**
 * Endpoints de verificación de salud y monitoreo
 */
export const createHealthRoutes = (): Router => {
    const router = Router();

    // Verificación básica de salud
    router.get('/health', async (req, res) => {
        try {
            const healthStatus = await getHealthStatus();
            const statusCode = healthStatus.status === 'healthy' ? 200 : 503;

            res.status(statusCode).json(healthStatus);
        } catch (error) {
            res.status(503).json({
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                service: 'Task Management API',
                version: process.env.npm_package_version || '1.0.0',
                error: 'Health check failed'
            });
        }
    });

    // Verificación detallada de salud para sistemas de monitoreo
    router.get('/health/detailed', async (req, res) => {
        try {
            const detailedHealth = await getDetailedHealthStatus();
            const statusCode = detailedHealth.status === 'healthy' ? 200 : 503;

            res.status(statusCode).json(detailedHealth);
        } catch (error) {
            res.status(503).json({
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: 'Detailed health check failed',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });

    // Sonda de preparación (para Kubernetes/orquestación de contenedores)
    router.get('/ready', async (req, res) => {
        try {
            const isReady = await checkReadiness();
            if (isReady) {
                res.status(200).json({ status: 'ready' });
            } else {
                res.status(503).json({ status: 'not ready' });
            }
        } catch (error) {
            res.status(503).json({ status: 'not ready', error: 'Readiness check failed' });
        }
    });

    // Sonda de vida (para Kubernetes/orquestación de contenedores)
    router.get('/live', (req, res) => {
        res.status(200).json({ status: 'alive' });
    });

    return router;
};
