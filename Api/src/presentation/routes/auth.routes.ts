import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { loginValidation, registerValidation } from '../validators/auth.validator';

export class AuthRoutes {
    private router: Router;

    constructor(
        private readonly authController: AuthController,
        private readonly authMiddleware: (req: any, res: any, next: any) => void
    ) {
        this.router = Router();
        this.setupRoutes();
    }

    private setupRoutes(): void {
        // Public routes
        this.router.post(
            '/registro',
            validate(registerValidation),
            this.authController.register
        );

        this.router.post(
            '/login',
            validate(loginValidation),
            this.authController.login
        );

        // Protected routes
        this.router.get(
            '/perfil',
            this.authMiddleware,
            this.authController.getProfile
        );
    }

    getRouter(): Router {
        return this.router;
    }
}

export const createAuthRoutes = (
    authController: AuthController,
    authMiddleware: (req: any, res: any, next: any) => void
): Router => {
    const authRoutes = new AuthRoutes(authController, authMiddleware);
    return authRoutes.getRouter();
};