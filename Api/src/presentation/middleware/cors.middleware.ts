import cors from 'cors';

/**
 * Configuración CORS para seguridad de API
 * Configura los ajustes de Cross-Origin Resource Sharing
 */
const corsOptions: cors.CorsOptions = {
    // Permitir solicitudes de orígenes específicos en producción
    origin: (origin, callback) => {
        // Permitir solicitudes sin origen (como aplicaciones móviles o solicitudes curl)
        if (!origin) return callback(null, true);

        const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:8080'
        ];

        if (process.env.NODE_ENV === 'development') {
            // En desarrollo, permitir todos los orígenes
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            return callback(new Error('Not allowed by CORS'));
        }
    },

    // Métodos HTTP permitidos
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

    // Encabezados permitidos
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
        'Pragma'
    ],

    // Permitir credenciales (cookies, encabezados de autorización)
    credentials: true,

    // Duración del caché de preflight (24 horas)
    maxAge: 86400,

// Incluir encabezados CORS en respuestas de error
    optionsSuccessStatus: 200
};

/**
 * Middleware CORS configurado para la API de gestión de tareas
 */
export const corsMiddleware = cors(corsOptions);

/**
 * Middleware CORS simple para desarrollo/pruebas
 */
export const simpleCors = cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
});