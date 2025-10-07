import { NextFunction, Request, Response } from 'express';
import { GetUserProfileUseCase } from '../../../application/use-cases/get-user-profile.use-case';
import { LoginUserUseCase } from '../../../application/use-cases/login-user.use-case';
import { RegisterUserUseCase } from '../../../application/use-cases/register-user.use-case';
import { ConflictError } from '../../../shared/errors/conflict.error';
import { NotFoundError } from '../../../shared/errors/not-found.error';
import { UnauthorizedError } from '../../../shared/errors/unauthorized.error';
import { ValidationError } from '../../../shared/errors/validation.error';
import { AuthController } from '../auth.controller';

// Mock use cases
jest.mock('../../../application/use-cases/register-user.use-case');
jest.mock('../../../application/use-cases/login-user.use-case');
jest.mock('../../../application/use-cases/get-user-profile.use-case');

describe('AuthController', () => {
    let authController: AuthController;
    let mockRegisterUserUseCase: jest.Mocked<RegisterUserUseCase>;
    let mockLoginUserUseCase: jest.Mocked<LoginUserUseCase>;
    let mockGetUserProfileUseCase: jest.Mocked<GetUserProfileUseCase>;
    let mockRequest: Partial<Request & { user?: { id: string; email: string } }>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        // Create mocked use cases
        mockRegisterUserUseCase = {
            execute: jest.fn()
        } as any;

        mockLoginUserUseCase = {
            execute: jest.fn()
        } as any;

        mockGetUserProfileUseCase = {
            execute: jest.fn()
        } as any;

        // Create controller instance
        authController = new AuthController(
            mockRegisterUserUseCase,
            mockLoginUserUseCase,
            mockGetUserProfileUseCase
        );

        // Mock Express objects
        mockRequest = {
            body: {},
            user: undefined
        };

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        mockNext = jest.fn();

        // Clear all mocks
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should register user successfully and return 201', async () => {
            // Arrange
            const registerData = {
                email: 'test@example.com',
                name: 'Test User',
                password: 'password123'
            };

            const expectedUser = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                email: 'test@example.com',
                name: 'Test User',
                createdAt: new Date()
            };

            mockRequest.body = registerData;
            mockRegisterUserUseCase.execute.mockResolvedValue(expectedUser);

            // Act
            await authController.register(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            // Assert
            expect(mockRegisterUserUseCase.execute).toHaveBeenCalledWith(registerData);
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Usuario registrado exitosamente',
                user: expectedUser
            });
        });

        it('should handle ConflictError and return 409', async () => {
            // Arrange
            const registerData = {
                email: 'existing@example.com',
                name: 'Test User',
                password: 'password123'
            };

            mockRequest.body = registerData;
            mockRegisterUserUseCase.execute.mockRejectedValue(
                new ConflictError('User with this email already exists')
            );

            // Act
            await authController.register(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(409);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Conflict',
                message: 'User with this email already exists'
            });
        });

        it('should handle ValidationError and return 400', async () => {
            // Arrange
            const registerData = {
                email: 'invalid-email',
                name: 'Test User',
                password: 'password123'
            };

            mockRequest.body = registerData;
            mockRegisterUserUseCase.execute.mockRejectedValue(
                new ValidationError('Invalid email format', 'email')
            );

            // Act
            await authController.register(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Validation Error',
                message: 'Invalid email format',
                field: 'email'
            });
        });

        it('should pass unexpected errors to next middleware', async () => {
            // Arrange
            const registerData = {
                email: 'test@example.com',
                name: 'Test User',
                password: 'password123'
            };

            const unexpectedError = new Error('Database connection failed');
            mockRequest.body = registerData;
            mockRegisterUserUseCase.execute.mockRejectedValue(unexpectedError);

            // Act
            await authController.register(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            // Assert
            expect(mockNext).toHaveBeenCalledWith(unexpectedError);
        });
    });

    describe('login', () => {
        it('should login user successfully and return 200', async () => {
            // Arrange
            const loginData = {
                email: 'test@example.com',
                password: 'password123'
            };

            const expectedResponse = {
                user: {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    email: 'test@example.com',
                    name: 'Test User',
                    createdAt: new Date()
                },
                token: 'jwt-token-here'
            };

            mockRequest.body = loginData;
            mockLoginUserUseCase.execute.mockResolvedValue(expectedResponse);

            // Act
            await authController.login(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            // Assert
            expect(mockLoginUserUseCase.execute).toHaveBeenCalledWith(loginData);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Login exitoso',
                ...expectedResponse
            });
        });

        it('should handle UnauthorizedError and return 401', async () => {
            // Arrange
            const loginData = {
                email: 'test@example.com',
                password: 'wrongpassword'
            };

            mockRequest.body = loginData;
            mockLoginUserUseCase.execute.mockRejectedValue(
                new UnauthorizedError('Invalid credentials')
            );

            // Act
            await authController.login(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Unauthorized',
                message: 'Invalid credentials'
            });
        });

        it('should handle ValidationError and return 400', async () => {
            // Arrange
            const loginData = {
                email: '',
                password: 'password123'
            };

            mockRequest.body = loginData;
            mockLoginUserUseCase.execute.mockRejectedValue(
                new ValidationError('Email is required', 'email')
            );

            // Act
            await authController.login(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Validation Error',
                message: 'Email is required',
                field: 'email'
            });
        });
    });

    describe('getProfile', () => {
        it('should get user profile successfully and return 200', async () => {
            // Arrange
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const expectedUser = {
                id: userId,
                email: 'test@example.com',
                name: 'Test User',
                createdAt: new Date()
            };

            mockRequest.user = { id: userId, email: 'test@example.com' };
            mockGetUserProfileUseCase.execute.mockResolvedValue(expectedUser);

            // Act
            await authController.getProfile(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            // Assert
            expect(mockGetUserProfileUseCase.execute).toHaveBeenCalledWith(userId);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Perfil obtenido exitosamente',
                user: expectedUser
            });
        });

        it('should return 401 when user is not authenticated', async () => {
            // Arrange
            mockRequest.user = undefined;

            // Act
            await authController.getProfile(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            // Assert
            expect(mockGetUserProfileUseCase.execute).not.toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Unauthorized',
                message: 'Usuario no autenticado'
            });
        });

        it('should handle NotFoundError and return 404', async () => {
            // Arrange
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            mockRequest.user = { id: userId, email: 'test@example.com' };
            mockGetUserProfileUseCase.execute.mockRejectedValue(
                new NotFoundError('User')
            );

            // Act
            await authController.getProfile(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Not Found',
                message: 'User not found'
            });
        });

        it('should handle ValidationError and return 400', async () => {
            // Arrange
            const userId = 'invalid-uuid';
            mockRequest.user = { id: userId, email: 'test@example.com' };
            mockGetUserProfileUseCase.execute.mockRejectedValue(
                new ValidationError('Invalid user ID format', 'userId')
            );

            // Act
            await authController.getProfile(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Validation Error',
                message: 'Invalid user ID format',
                field: 'userId'
            });
        });
    });
});