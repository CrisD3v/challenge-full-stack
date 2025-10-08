import compression from 'compression';
import express, { Application } from 'express';
import helmet from 'helmet';
import { DependencyContainer } from '../infrastructure/container/dependency-container';
import { requestLogger } from './middleware/logging.middleware';
import { corsMiddleware } from './middleware/cors.middleware';
import { errorHandler } from './middleware/error-handler.middleware';
import { createApiRoutes, createHealthRoutes } from './routes';

/**
 * Express application factory
 * Crea y configura la aplicación Express con todos los middlewares y rutas
 */
export const createApp = (container: DependencyContainer): Application => {
    const app = express();

    // Middleware de seguridad (debe ir primero)
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
            },
        },
        crossOriginEmbedderPolicy: false
    }));

    // CORS configuracion
    app.use(corsMiddleware);

    // Middleware de compresión
    app.use(compression());

    // Middleware de parseo del cuerpo de la petición
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging middleware
    app.use(requestLogger);

    // Health check routes (sin rate limiting)
    app.use('/', createHealthRoutes());

    // API routes con rate limiting
    app.use('/api', createApiRoutes(container));

    // Manejador 404 para rutas no definidas
    app.use((req, res) => {
        res.status(404).json({
            error: 'Not Found',
            message: `Route ${req.method} ${req.originalUrl} not found`,
            timestamp: new Date().toISOString()
        });
    });

    // Middleware Manejo de errores globales
    app.use(errorHandler);

    return app;
};

/**
 * Interfaz de configuración de la aplicación
 */
export interface AppConfig {
    port: number;
    nodeEnv: string;
}

/**
 * Iniciar el servidor Express
 */
export const startServer = (app: Application, config: AppConfig): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            const server = app.listen(config.port, () => {
                console.log(`🚀 Task Management API started successfully`);
                console.log(`📍 Server running on port ${config.port}`);
                console.log(`🌍 Environment: ${config.nodeEnv}`);
                console.log(`📊 Health check: http://localhost:${config.port}/health`);
                console.log(`🔗 API base URL: http://localhost:${config.port}/api`);
                resolve();
            });

            // Manejo de cierre elegante
            const gracefulShutdown = async (signal: string) => {
                console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

                server.close(async () => {
                    console.log('📴 HTTP server closed');

                    try {
                        // Clean up database connections and other resources
                        const container = DependencyContainer.getInstance();
                        await container.cleanup();
                        console.log('🧹 Resources cleaned up');

                        console.log('✅ Graceful shutdown completed');
                        process.exit(0);
                    } catch (error) {
                        console.error('❌ Error during cleanup:', error);
                        process.exit(1);
                    }
                });

                // Forzar cierre después de 10 segundos
                setTimeout(() => {
                    console.error('⚠️  Forced shutdown after timeout');
                    process.exit(1);
                }, 10000);
            };

            // Manejar señales de cierre
            process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
            process.on('SIGINT', () => gracefulShutdown('SIGINT'));

            // Manejar excepciones no capturadas
            process.on('uncaughtException', (error) => {
                console.error('💥 Uncaught Exception:', error);
                gracefulShutdown('uncaughtException');
            });

            // Manejar rechazos de promesas no manejados
            process.on('unhandledRejection', (reason, promise) => {
                console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
                gracefulShutdown('unhandledRejection');
            });

        } catch (error) {
            reject(error);
        }
    });
};
