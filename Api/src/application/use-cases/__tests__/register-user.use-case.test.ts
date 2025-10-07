import { User } from '../../../domain/entities/user';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { IPasswordHasher } from '../../../infrastructure/security/password-hasher.service';
import { ConflictError } from '../../../shared/errors/conflict.error';
import { ValidationError } from '../../../shared/errors/validation.error';
import { RegisterUserUseCase } from '../register-user.use-case';

describe('RegisterUserUseCase', () => {
    let useCase: RegisterUserUseCase;
    let mockUserRepository: jest.Mocked<UserRepository>;
    let mockPasswordHasher: jest.Mocked<IPasswordHasher>;

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

        useCase = new RegisterUserUseCase(mockUserRepository, mockPasswordHasher);
    });

    describe('execute', () => {
        const validDto = {
            email: 'test@example.com',
            name: 'Test User',
            password: 'password123'
        };

        it('should register a new user successfully', async () => {
            // Preparar
            const hashedPassword = 'hashed_password';
            const createdUser = new User(
                '123e4567-e89b-12d3-a456-426614174000',
                validDto.email,
                validDto.name,
                hashedPassword,
                new Date()
            );

            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockPasswordHasher.hash.mockResolvedValue(hashedPassword);
            mockUserRepository.create.mockResolvedValue(createdUser);

            // Actuar
            const result = await useCase.execute(validDto);

            // Verificar
            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(validDto.email);
            expect(mockPasswordHasher.hash).toHaveBeenCalledWith(validDto.password);
            expect(mockUserRepository.create).toHaveBeenCalledWith({
                email: validDto.email,
                name: validDto.name,
                hashedPassword
            });
            expect(result).toEqual(createdUser.toPublicData());
        });

        it('should throw ConflictError when user already exists', async () => {
            // Preparar
            const existingUser = new User(
                '123e4567-e89b-12d3-a456-426614174000',
                validDto.email,
                'Existing User',
                'hashed_password',
                new Date()
            );

            mockUserRepository.findByEmail.mockResolvedValue(existingUser);

            // Actuar y Verificar
            await expect(useCase.execute(validDto)).rejects.toThrow(ConflictError);
            await expect(useCase.execute(validDto)).rejects.toThrow('User with this email already exists');
            expect(mockPasswordHasher.hash).not.toHaveBeenCalled();
            expect(mockUserRepository.create).not.toHaveBeenCalled();
        });

        it('should throw ValidationError when email is empty', async () => {
            // Preparar
            const invalidDto = { ...validDto, email: '' };

            // Actuar y Verificar
            await expect(useCase.execute(invalidDto)).rejects.toThrow(ValidationError);
            await expect(useCase.execute(invalidDto)).rejects.toThrow('Email is required');
        });

        it('should throw ValidationError when email is invalid format', async () => {
            // Preparar
            const invalidDto = { ...validDto, email: 'invalid-email' };

            // Actuar y Verificar
            await expect(useCase.execute(invalidDto)).rejects.toThrow(ValidationError);
            await expect(useCase.execute(invalidDto)).rejects.toThrow('Invalid email format');
        });

        it('should throw ValidationError when name is empty', async () => {
            // Preparar
            const invalidDto = { ...validDto, name: '' };

            // Actuar y Verificar
            await expect(useCase.execute(invalidDto)).rejects.toThrow(ValidationError);
            await expect(useCase.execute(invalidDto)).rejects.toThrow('Name is required');
        });

        it('should throw ValidationError when name exceeds 255 characters', async () => {
            // Preparar
            const longName = 'a'.repeat(256);
            const invalidDto = { ...validDto, name: longName };

            // Actuar y Verificar
            await expect(useCase.execute(invalidDto)).rejects.toThrow(ValidationError);
            await expect(useCase.execute(invalidDto)).rejects.toThrow('Name cannot exceed 255 characters');
        });

        it('should throw ValidationError when password is empty', async () => {
            // Preparar
            const invalidDto = { ...validDto, password: '' };

            // Actuar y Verificar
            await expect(useCase.execute(invalidDto)).rejects.toThrow(ValidationError);
            await expect(useCase.execute(invalidDto)).rejects.toThrow('Password is required');
        });

        it('should throw ValidationError when password is too short', async () => {
            // Preparar
            const invalidDto = { ...validDto, password: '12345' };

            // Actuar y Verificar
            await expect(useCase.execute(invalidDto)).rejects.toThrow(ValidationError);
            await expect(useCase.execute(invalidDto)).rejects.toThrow('Password must be at least 6 characters long');
        });

        it('should handle repository errors', async () => {
            // Preparar
            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockPasswordHasher.hash.mockResolvedValue('hashed_password');
            mockUserRepository.create.mockRejectedValue(new Error('Database error'));

            // Actuar y Verificar
            await expect(useCase.execute(validDto)).rejects.toThrow('Database error');
        });

        it('should handle password hashing errors', async () => {
            // Preparar
            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockPasswordHasher.hash.mockRejectedValue(new Error('Hashing error'));

            // Actuar y Verificar
            await expect(useCase.execute(validDto)).rejects.toThrow('Hashing error');
        });
    });
});