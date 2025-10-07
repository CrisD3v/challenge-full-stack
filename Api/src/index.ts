// Main application entry point
import { config } from './infrastructure/config/app.config';
import { DependencyContainer } from './infrastructure/container/dependency-container';
import { logger } from './infrastructure/logging/logger';
import { createApp, startServer } from './presentation/app';

async function startApplication(): Promise<void> {
    try {
        logger.info('Starting Task Management API...');

        // Inicializar contenedor de dependencias
        const container = DependencyContainer.getInstance();
        logger.info('Dependency container initialized');

        // Crear aplicación Express
        const app = createApp(container);
        logger.info('Express application created');

        // Iniciar el servidor
        await startServer(app, {
            port: config.port,
            nodeEnv: config.nodeEnv
        });

        logger.info(`Task Management API started successfully`);
        logger.info(`Environment: ${config.nodeEnv}`);
        logger.info(`Port: ${config.port}`);

    } catch (error) {
        logger.error('Failed to start application', error);
        process.exit(1);
    }
}

// Iniciar la aplicación
if (require.main === module) {
    startApplication();
}

export { };