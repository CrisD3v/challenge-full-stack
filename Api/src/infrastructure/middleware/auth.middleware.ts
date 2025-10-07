import { NextFunction, Request, Response } from 'express';
import { IJWTService } from '../security/jwt.service';

// Extender la interfaz Request de Express para incluir usuario
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
            };
        }
    }
}

export class AuthMiddleware {
    constructor(private jwtService: IJWTService) { }

    authenticate = (req: Request, res: Response, next: NextFunction): void => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader) {
                res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Authorization header is required'
                });
                return;
            }

            const token = this.extractTokenFromHeader(authHeader);

            if (!token) {
                res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Bearer token is required'
                });
                return;
            }

            const payload = this.jwtService.verifyToken(token);

            req.user = {
                id: payload.userId,
                email: payload.email
            };

            next();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Invalid token';

            res.status(401).json({
                error: 'Unauthorized',
                message
            });
        }
    };

    private extractTokenFromHeader(authHeader: string): string | null {
        const parts = authHeader.split(' ');

        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return null;
        }

        return parts[1] || null;
    }
}

// Función factory para crear instancia del middleware
export const createAuthMiddleware = (jwtService: IJWTService) => {
    const authMiddleware = new AuthMiddleware(jwtService);
    return authMiddleware.authenticate;
};