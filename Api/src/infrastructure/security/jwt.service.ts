import jwt from 'jsonwebtoken';

export interface JWTPayload {
    userId: string;
    email: string;
}

export interface IJWTService {
    generateToken(payload: JWTPayload): string;
    verifyToken(token: string): JWTPayload;
}

export class JWTService implements IJWTService {
    private readonly secret: string;
    private readonly expiresIn: string;
    private readonly issuer: string;

    constructor(
        secret?: string,
        expiresIn?: string,
        issuer?: string
    ) {
        this.secret = secret || process.env.JWT_SECRET || 'your-secret-key';
        this.expiresIn = expiresIn || process.env.JWT_EXPIRES_IN || '24h';
        this.issuer = issuer || process.env.JWT_ISSUER || 'task-management-api';

        if (!secret && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your-secret-key')) {
            console.warn('Warning: Using default JWT secret. Set JWT_SECRET environment variable for production.');
        }
    }

    generateToken(payload: JWTPayload): string {
        if (!payload.userId || !payload.email) {
            throw new Error('Invalid payload: userId and email are required');
        }

        return jwt.sign(payload, this.secret, {
            expiresIn: this.expiresIn,
            issuer: this.issuer,
            subject: payload.userId
        } as any);
    }

    verifyToken(token: string): JWTPayload {
        if (!token) {
            throw new Error('Token is required');
        }

        try {
            const decoded = jwt.verify(token, this.secret, {
                issuer: this.issuer
            }) as jwt.JwtPayload;

            if (!decoded.userId || !decoded.email) {
                throw new Error('Invalid token payload');
            }

            return {
                userId: decoded.userId,
                email: decoded.email
            };
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new Error('Token expired');
            }
            if (error instanceof jwt.JsonWebTokenError) {
                throw new Error('Invalid token');
            }
            throw error;
        }
    }
}