import { NextFunction, Request, Response } from 'express';
import { GetUserProfileUseCase } from '../../application/use-cases/get-user-profile.use-case';
import { LoginUserUseCase } from '../../application/use-cases/login-user.use-case';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case';
import { ConflictError } from '../../shared/errors/conflict.error';
import { NotFoundError } from '../../shared/errors/not-found.error';
import { UnauthorizedError } from '../../shared/errors/unauthorized.error';
import { ValidationError } from '../../shared/errors/validation.error';

export class AuthController {
    constructor(
        private readonly registerUserUseCase: RegisterUserUseCase,
        private readonly loginUserUseCase: LoginUserUseCase,
        private readonly getUserProfileUseCase: GetUserProfileUseCase
    ) { }

    /**
     * Registrar un nuevo usuario
     * POST /api/auth/registro
     */
    register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { email, name, password } = req.body;

            const user = await this.registerUserUseCase.execute({
                email,
                name,
                password
            });

            res.status(201).json({
                message: 'Usuario registrado exitosamente',
                user
            });
        } catch (error) {
            this.handleError(error, res, next);
        }
    };

    /**
     * Login de usuario
     * POST /api/auth/login
     */
    login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { email, password } = req.body;

            const result = await this.loginUserUseCase.execute({
                email,
                password
            });

            res.status(200).json({
                message: 'Login exitoso',
                ...result
            });
        } catch (error) {
            this.handleError(error, res, next);
        }
    };

    /**
     * Obtener perfil de usuario
     * GET /api/auth/perfil
     */
    getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // El ID del usuario viene del middleware de auth
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Usuario no autenticado'
                });
                return;
            }

            const user = await this.getUserProfileUseCase.execute(userId);

            res.status(200).json({
                message: 'Perfil obtenido exitosamente',
                user
            });
        } catch (error) {
            this.handleError(error, res, next);
        }
    };

    /**
     * Manejar errores y retornar respuestas HTTP apropiadas
     */
    private handleError(error: unknown, res: Response, next: NextFunction): void {
        if (error instanceof ValidationError) {
            res.status(400).json({
                error: 'Validation Error',
                message: error.message,
                field: error.field
            });
            return;
        }

        if (error instanceof ConflictError) {
            res.status(409).json({
                error: 'Conflict',
                message: error.message
            });
            return;
        }

        if (error instanceof UnauthorizedError) {
            res.status(401).json({
                error: 'Unauthorized',
                message: error.message
            });
            return;
        }

        if (error instanceof NotFoundError) {
            res.status(404).json({
                error: 'Not Found',
                message: error.message
            });
            return;
        }

        // Para errores inesperados, pasar al manejador global de errores
        next(error);
    }
}