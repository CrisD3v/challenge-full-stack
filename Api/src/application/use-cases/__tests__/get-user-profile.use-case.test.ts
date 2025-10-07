import { User } from '../../../domain/entities/user';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { NotFoundError } from '../../../shared/errors/not-found.error';
import { ValidationError } from '../../../shared/errors/validation.error';
import { GetUserProfileUseCase } from '../get-user-profile.use-case';

describe('GetUserProfileUseCase', () => {
    let useCase: GetUserProfileUseCase;
    let mockUserRepository: jest.Mocked<UserRepository>;

    beforeEach(() => {
        mockUserRepository = {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
            existsByEmail: jest.fn()
        };

        useCase = new GetUserProfileUseCase(mockUserRepository);
    });

    describe('execute', () => {
        const validUserId = '123e4567-e89b-12d3-a456-426614174000';

        const mockUser = new User(
            validUserId,
            'test@example.com',
            'Test User',
            'hashed_password',
            new Date()
        );

        it('should return user profile successfully', async () => {
            // Preparar
            mockUserRepository.findById.mockResolvedValue(mockUser);

            // Actuar
            const result = await useCase.execute(validUserId);

            // Verificar
            expect(mockUserRepository.findById).toHaveBeenCalledWith(validUserId);
            expect(result).toEqual(mockUser.toPublicData());
            expect(result).not.toHaveProperty('hashedPassword');
        });

        it('should throw NotFoundError when user does not exist', async () => {
            // Preparar
            mockUserRepository.findById.mockResolvedValue(null);

            // Actuar y Verificar
            await expect(useCase.execute(validUserId)).rejects.toThrow(NotFoundError);
            await expect(useCase.execute(validUserId)).rejects.toThrow('User not found');
        });

        it('should throw ValidationError when userId is empty', async () => {
            // Preparar
            const emptyUserId = '';

            // Actuar y Verificar
            await expect(useCase.execute(emptyUserId)).rejects.toThrow(ValidationError);
            await expect(useCase.execute(emptyUserId)).rejects.toThrow('User ID is required');
        });

        it('should throw ValidationError when userId is only whitespace', async () => {
            // Preparar
            const whitespaceUserId = '   ';

            // Actuar y Verificar
            await expect(useCase.execute(whitespaceUserId)).rejects.toThrow(ValidationError);
            await expect(useCase.execute(whitespaceUserId)).rejects.toThrow('User ID is required');
        });

        it('should throw ValidationError when userId format is invalid', async () => {
            // Preparar
            const invalidUserId = 'invalid-uuid-format';

            // Actuar y Verificar
            await expect(useCase.execute(invalidUserId)).rejects.toThrow(ValidationError);
            await expect(useCase.execute(invalidUserId)).rejects.toThrow('Invalid user ID format');
        });

        it('should handle repository errors', async () => {
            // Preparar
            mockUserRepository.findById.mockRejectedValue(new Error('Database error'));

            // Actuar y Verificar
            await expect(useCase.execute(validUserId)).rejects.toThrow('Database error');
        });

        it('should accept valid UUID formats', async () => {
            // Preparar
            const validUUIDs = [
                '123e4567-e89b-12d3-a456-426614174000',
                'f47ac10b-58cc-4372-a567-0e02b2c3d479',
                '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
                '6ba7b811-9dad-11d1-80b4-00c04fd430c8'
            ];

            mockUserRepository.findById.mockResolvedValue(mockUser);

            // Actuar y Verificar
            for (const uuid of validUUIDs) {
                await expect(useCase.execute(uuid)).resolves.toBeDefined();
            }
        });

        it('should reject invalid UUID formats', async () => {
            // Preparar
            const invalidUUIDs = [
                '123e4567-e89b-12d3-a456-42661417400', // muy corto
                '123e4567-e89b-12d3-a456-426614174000x', // muy largo
                '123e4567-e89b-12d3-a456-426614174000-', // guión extra
                'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', // caracteres inválidos
                '123e4567e89b12d3a456426614174000', // sin guiones
                '123e4567-e89b-12d3-a456', // incompleto
            ];

            // Actuar y Verificar
            for (const uuid of invalidUUIDs) {
                await expect(useCase.execute(uuid)).rejects.toThrow(ValidationError);
            }
        });
    });
});