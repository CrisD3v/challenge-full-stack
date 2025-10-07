import { Router } from 'express';
import { DependencyContainer } from '../../infrastructure/container/dependency-container';
import { createAuthMiddleware } from '../../infrastructure/middleware/auth.middleware';
import { checkReadiness, getDetailedHealthStatus, getHealthStatus } from '../../infrastructure/monitoring/health-service';
import { authRateLimit, generalRateLimit } from '../middleware/rate-limit.middleware';
import { createAuthRoutes } from './auth.routes';

/**
 * Main router configuration that sets up all API routes
 * Configures all endpoints with proper middleware and rate limiting
 */
export const createApiRoutes = (container: DependencyContainer): Router => {
    const router = Router();

    // Get services from container
    const jwtService = container.getJWTService();
    const authController = container.getAuthController();

    // Create middleware instances
    const authMiddleware = createAuthMiddleware(jwtService);

    // Authentication routes with stricter rate limiting
    // /api/auth/*
    router.use('/auth', authRateLimit, createAuthRoutes(authController, authMiddleware));

    return router;
};

/**
 * Health check and monitoring endpoints
 */
export const createHealthRoutes = (): Router => {
    const router = Router();

    // Basic health check
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

    // Detailed health check for monitoring systems
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

    // Readiness probe (for Kubernetes/container orchestration)
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

    // Liveness probe (for Kubernetes/container orchestration)
    router.get('/live', (req, res) => {
        res.status(200).json({ status: 'alive' });
    });

    return router;
};