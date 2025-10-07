import { User } from '../../../domain/entities/user';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { IJWTService } from '../../../infrastructure/security/jwt.service';
import { IPasswordHasher } from '../../../infrastructure/security/password-hasher.service';
import { UnauthorizedError } from '../../../shared/errors/unauthorized.error';
import { ValidationError } from '../../../shared/errors/validation.error';
import { LoginUserUseCase } from '../login-user.use-case';

describe('LoginUserUseCase', () => {
    let useCase: LoginUserUseCase;
    let mockUserRepository: jest.Mocked<UserRepository>;
    let mockPasswordHasher: jest.Mocked<IPasswordHasher>;
    let mockJwtService: jest.Mocked<IJWTService>;

    beforeEach(() => {
        mockUserRepository = {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
            existsByEmail: jest.fn()
        };

        mockPasswordHasher = {
            hash: jest.fn(),
            compare: jest.fn()
        };

        mockJwtService = {
            generateToken: jest.fn(),
            verifyToken: jest.fn()
        };

        useCase = new LoginUserUseCase(mockUserRepository, mockPasswordHasher, mockJwtService);
    });

    describe('execute', () => {
        const validDto = {
            email: 'test@example.com',
            password: 'password123'
        };

        const mockUser = new User(
            '123e4567-e89b-12d3-a456-426614174000',
            'test@example.com',
            'Test User',
            'hashed_password',
            new Date()
        );

        it('should login user successfully with valid credentials', async () => {
            // Preparar
            const expectedToken = 'jwt_token_123';

            mockUserRepository.findByEmail.mockResolvedValue(mockUser);
            mockPasswordHasher.compare.mockResolvedValue(true);
            mockJwtService.generateToken.mockReturnValue(expectedToken);

            // Actuar
            const result = await useCase.execute(validDto);

            // Verificar
            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(validDto.email);
            expect(mockPasswordHasher.compare).toHaveBeenCalledWith(validDto.password, mockUser.getHashedPassword());
            expect(mockJwtService.generateToken).toHaveBeenCalledWith({
                userId: mockUser.id,
                email: mockUser.email
            });
            expect(result).toEqual({
                user: mockUser.toPublicData(),
                token: expectedToken
            });
        });

        it('should throw UnauthorizedError when user does not exist', async () => {
            // Preparar
            mockUserRepository.findByEmail.mockResolvedValue(null);

            // Actuar y Verificar
            await expect(useCase.execute(validDto)).rejects.toThrow(UnauthorizedError);
            await expect(useCase.execute(validDto)).rejects.toThrow('Invalid credentials');
            expect(mockPasswordHasher.compare).not.toHaveBeenCalled();
            expect(mockJwtService.generateToken).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedError when password is invalid', async () => {
            // Preparar
            mockUserRepository.findByEmail.mockResolvedValue(mockUser);
            mockPasswordHasher.compare.mockResolvedValue(false);

            // Actuar y Verificar
            await expect(useCase.execute(validDto)).rejects.toThrow(UnauthorizedError);
            await expect(useCase.execute(validDto)).rejects.toThrow('Invalid credentials');
            expect(mockJwtService.generateToken).not.toHaveBeenCalled();
        });

        it('should throw ValidationError when email is empty', async () => {
            // Preparar
            const invalidDto = { ...validDto, email: '' };

            // Actuar y Verificar
            await expect(useCase.execute(invalidDto)).rejects.toThrow(ValidationError);
            await expect(useCase.execute(invalidDto)).rejects.toThrow('Email is required');
        });

        it('should throw ValidationError when email format is invalid', async () => {
            // Preparar
            const invalidDto = { ...validDto, email: 'invalid-email' };

            // Actuar y Verificar
            await expect(useCase.execute(invalidDto)).rejects.toThrow(ValidationError);
            await expect(useCase.execute(invalidDto)).rejects.toThrow('Invalid email format');
        });

        it('should throw ValidationError when password is empty', async () => {
            // Preparar
            const invalidDto = { ...validDto, password: '' };

            // Actuar y Verificar
            await expect(useCase.execute(invalidDto)).rejects.toThrow(ValidationError);
            await expect(useCase.execute(invalidDto)).rejects.toThrow('Password is required');
        });

        it('should handle repository errors', async () => {
            // Preparar
            mockUserRepository.findByEmail.mockRejectedValue(new Error('Database error'));

            // Actuar y Verificar
            await expect(useCase.execute(validDto)).rejects.toThrow('Database error');
        });

        it('should handle password comparison errors', async () => {
            // Preparar
            mockUserRepository.findByEmail.mockResolvedValue(mockUser);
            mockPasswordHasher.compare.mockRejectedValue(new Error('Hashing error'));

            // Actuar y Verificar
            await expect(useCase.execute(validDto)).rejects.toThrow('Hashing error');
        });

        it('should handle JWT generation errors', async () => {
            // Preparar
            mockUserRepository.findByEmail.mockResolvedValue(mockUser);
            mockPasswordHasher.compare.mockResolvedValue(true);
            mockJwtService.generateToken.mockImplementation(() => {
                throw new Error('JWT generation error');
            });

            // Actuar y Verificar
            await expect(useCase.execute(validDto)).rejects.toThrow('JWT generation error');
        });
    });
});