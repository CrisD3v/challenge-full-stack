import { User } from '../entities/user';

describe('User Entity', () => {
    const validUserData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        name: 'Test User',
        hashedPassword: 'hashed_password_123',
        createdAt: new Date('2023-01-01T00:00:00Z')
    };

    describe('constructor', () => {
        it('should create user with valid data', () => {
            const user = new User(
                validUserData.id,
                validUserData.email,
                validUserData.name,
                validUserData.hashedPassword,
                validUserData.createdAt
            );

            expect(user.id).toBe(validUserData.id);
            expect(user.email).toBe(validUserData.email);
            expect(user.name).toBe(validUserData.name);
            expect(user.createdAt).toBe(validUserData.createdAt);
        });

        it('should throw error for invalid email', () => {
            expect(() => new User(
                validUserData.id,
                'invalid-email',
                validUserData.name,
                validUserData.hashedPassword,
                validUserData.createdAt
            )).toThrow('Invalid email format');
        });

        it('should throw error for empty name', () => {
            expect(() => new User(
                validUserData.id,
                validUserData.email,
                '',
                validUserData.hashedPassword,
                validUserData.createdAt
            )).toThrow('Name cannot be empty');
        });

        it('should throw error for name too long', () => {
            const longName = 'a'.repeat(256);
            expect(() => new User(
                validUserData.id,
                validUserData.email,
                longName,
                validUserData.hashedPassword,
                validUserData.createdAt
            )).toThrow('Name cannot exceed 255 characters');
        });
    });

    describe('getHashedPassword', () => {
        it('should return hashed password', () => {
            const user = new User(
                validUserData.id,
                validUserData.email,
                validUserData.name,
                validUserData.hashedPassword,
                validUserData.createdAt
            );

            expect(user.getHashedPassword()).toBe(validUserData.hashedPassword);
        });
    });

    describe('toPublicData', () => {
        it('should return user data without sensitive information', () => {
            const user = new User(
                validUserData.id,
                validUserData.email,
                validUserData.name,
                validUserData.hashedPassword,
                validUserData.createdAt
            );

            const publicData = user.toPublicData();

            expect(publicData).toEqual({
                id: validUserData.id,
                email: validUserData.email,
                name: validUserData.name,
                createdAt: validUserData.createdAt
            });
            expect(publicData).not.toHaveProperty('hashedPassword');
        });
    });

    describe('equals', () => {
        it('should return true for users with same id', () => {
            const user1 = new User(
                validUserData.id,
                validUserData.email,
                validUserData.name,
                validUserData.hashedPassword,
                validUserData.createdAt
            );

            const user2 = new User(
                validUserData.id,
                'different@email.com',
                'Different Name',
                'different_password',
                new Date()
            );

            expect(user1.equals(user2)).toBe(true);
        });

        it('should return false for users with different ids', () => {
            const user1 = new User(
                validUserData.id,
                validUserData.email,
                validUserData.name,
                validUserData.hashedPassword,
                validUserData.createdAt
            );

            const user2 = new User(
                'different-id',
                validUserData.email,
                validUserData.name,
                validUserData.hashedPassword,
                validUserData.createdAt
            );

            expect(user1.equals(user2)).toBe(false);
        });
    });
});