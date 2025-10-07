import { Category } from '../entities/category';

describe('Category Entity', () => {
    const validCategoryData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Work',
        color: '#FF0000',
        userId: 'user-123'
    };

    describe('constructor', () => {
        it('should create category with valid data', () => {
            const category = new Category(
                validCategoryData.id,
                validCategoryData.name,
                validCategoryData.color,
                validCategoryData.userId
            );

            expect(category.id).toBe(validCategoryData.id);
            expect(category.name).toBe(validCategoryData.name);
            expect(category.color).toBe(validCategoryData.color);
            expect(category.userId).toBe(validCategoryData.userId);
        });

        it('should create category with null color', () => {
            const category = new Category(
                validCategoryData.id,
                validCategoryData.name,
                null,
                validCategoryData.userId
            );

            expect(category.color).toBeNull();
        });

        it('should throw error for empty name', () => {
            expect(() => new Category(
                validCategoryData.id,
                '',
                validCategoryData.color,
                validCategoryData.userId
            )).toThrow('Category name cannot be empty');
        });

        it('should throw error for whitespace-only name', () => {
            expect(() => new Category(
                validCategoryData.id,
                '   ',
                validCategoryData.color,
                validCategoryData.userId
            )).toThrow('Category name cannot be empty');
        });

        it('should throw error for name too long', () => {
            const longName = 'a'.repeat(256);
            expect(() => new Category(
                validCategoryData.id,
                longName,
                validCategoryData.color,
                validCategoryData.userId
            )).toThrow('Category name cannot exceed 255 characters');
        });

        it('should throw error for invalid color format', () => {
            expect(() => new Category(
                validCategoryData.id,
                validCategoryData.name,
                'invalid-color',
                validCategoryData.userId
            )).toThrow('Color must be a valid hex color code (e.g., #FF0000)');
        });

        it('should throw error for color without hash', () => {
            expect(() => new Category(
                validCategoryData.id,
                validCategoryData.name,
                'FF0000',
                validCategoryData.userId
            )).toThrow('Color must be a valid hex color code (e.g., #FF0000)');
        });

        it('should throw error for short hex color', () => {
            expect(() => new Category(
                validCategoryData.id,
                validCategoryData.name,
                '#FFF',
                validCategoryData.userId
            )).toThrow('Color must be a valid hex color code (e.g., #FF0000)');
        });

        it('should throw error for empty user ID', () => {
            expect(() => new Category(
                validCategoryData.id,
                validCategoryData.name,
                validCategoryData.color,
                ''
            )).toThrow('User ID cannot be empty');
        });

        it('should throw error for whitespace-only user ID', () => {
            expect(() => new Category(
                validCategoryData.id,
                validCategoryData.name,
                validCategoryData.color,
                '   '
            )).toThrow('User ID cannot be empty');
        });
    });

    describe('belongsToUser', () => {
        it('should return true for correct user', () => {
            const category = new Category(
                validCategoryData.id,
                validCategoryData.name,
                validCategoryData.color,
                validCategoryData.userId
            );

            expect(category.belongsToUser('user-123')).toBe(true);
            expect(category.belongsToUser('different-user')).toBe(false);
        });
    });

    describe('equals', () => {
        it('should return true for categories with same id', () => {
            const category1 = new Category(
                validCategoryData.id,
                validCategoryData.name,
                validCategoryData.color,
                validCategoryData.userId
            );

            const category2 = new Category(
                validCategoryData.id,
                'Different Name',
                '#00FF00',
                'different-user'
            );

            expect(category1.equals(category2)).toBe(true);
        });

        it('should return false for categories with different ids', () => {
            const category1 = new Category(
                validCategoryData.id,
                validCategoryData.name,
                validCategoryData.color,
                validCategoryData.userId
            );

            const category2 = new Category(
                'different-id',
                validCategoryData.name,
                validCategoryData.color,
                validCategoryData.userId
            );

            expect(category1.equals(category2)).toBe(false);
        });
    });
});