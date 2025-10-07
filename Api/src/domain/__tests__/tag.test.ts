import { Tag } from '../entities/tag';

describe('Tag Entity', () => {
    const validTagData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'urgent',
        userId: 'user-123'
    };

    describe('constructor', () => {
        it('should create tag with valid data', () => {
            const tag = new Tag(
                validTagData.id,
                validTagData.name,
                validTagData.userId
            );

            expect(tag.id).toBe(validTagData.id);
            expect(tag.name).toBe(validTagData.name);
            expect(tag.userId).toBe(validTagData.userId);
        });

        it('should throw error for empty name', () => {
            expect(() => new Tag(
                validTagData.id,
                '',
                validTagData.userId
            )).toThrow('Tag name cannot be empty');
        });

        it('should throw error for whitespace-only name', () => {
            expect(() => new Tag(
                validTagData.id,
                '   ',
                validTagData.userId
            )).toThrow('Tag name cannot be empty');
        });

        it('should throw error for name too long', () => {
            const longName = 'a'.repeat(101);
            expect(() => new Tag(
                validTagData.id,
                longName,
                validTagData.userId
            )).toThrow('Tag name cannot exceed 100 characters');
        });

        it('should accept name at maximum length', () => {
            const maxLengthName = 'a'.repeat(100);
            const tag = new Tag(
                validTagData.id,
                maxLengthName,
                validTagData.userId
            );

            expect(tag.name).toBe(maxLengthName);
        });

        it('should throw error for empty user ID', () => {
            expect(() => new Tag(
                validTagData.id,
                validTagData.name,
                ''
            )).toThrow('User ID cannot be empty');
        });

        it('should throw error for whitespace-only user ID', () => {
            expect(() => new Tag(
                validTagData.id,
                validTagData.name,
                '   '
            )).toThrow('User ID cannot be empty');
        });
    });

    describe('belongsToUser', () => {
        it('should return true for correct user', () => {
            const tag = new Tag(
                validTagData.id,
                validTagData.name,
                validTagData.userId
            );

            expect(tag.belongsToUser('user-123')).toBe(true);
            expect(tag.belongsToUser('different-user')).toBe(false);
        });
    });

    describe('equals', () => {
        it('should return true for tags with same id', () => {
            const tag1 = new Tag(
                validTagData.id,
                validTagData.name,
                validTagData.userId
            );

            const tag2 = new Tag(
                validTagData.id,
                'Different Name',
                'different-user'
            );

            expect(tag1.equals(tag2)).toBe(true);
        });

        it('should return false for tags with different ids', () => {
            const tag1 = new Tag(
                validTagData.id,
                validTagData.name,
                validTagData.userId
            );

            const tag2 = new Tag(
                'different-id',
                validTagData.name,
                validTagData.userId
            );

            expect(tag1.equals(tag2)).toBe(false);
        });
    });
});