import { ConflictError } from '../conflict.error';

describe('ConflictError', () => {
  describe('constructor', () => {
    it('should create error with message only', () => {
      const error = new ConflictError('Resource conflict');

      expect(error.message).toBe('Resource conflict');
      expect(error.code).toBe('CONFLICT');
      expect(error.statusCode).toBe(409);
      expect(error.name).toBe('ConflictError');
      expect(error.conflictType).toBeUndefined();
      expect(error.conflictValue).toBeUndefined();
    });

    it('should create error with conflict type and value', () => {
      const error = new ConflictError(
        'Email already exists',
        'DUPLICATE',
        'test@example.com'
      );

      expect(error.message).toBe('Email already exists');
      expect(error.conflictType).toBe('DUPLICATE');
      expect(error.conflictValue).toBe('test@example.com');
    });
  });

  describe('duplicate', () => {
    it('should create duplicate resource error', () => {
      const error = ConflictError.duplicate('User', 'email', 'test@example.com');

      expect(error.message).toBe("User with email 'test@example.com' already exists");
      expect(error.conflictType).toBe('DUPLICATE');
      expect(error.conflictValue).toBe('test@example.com');
      expect(error.code).toBe('CONFLICT');
      expect(error.statusCode).toBe(409);
    });
  });

  describe('businessRule', () => {
    it('should create business rule violation error', () => {
      const error = ConflictError.businessRule('Cannot delete category with existing tasks');

      expect(error.message).toBe('Cannot delete category with existing tasks');
      expect(error.conflictType).toBe('BUSINESS_RULE');
      expect(error.conflictValue).toBeUndefined();
      expect(error.code).toBe('CONFLICT');
      expect(error.statusCode).toBe(409);
    });
  });

  describe('inheritance', () => {
    it('should be instance of Error', () => {
      const error = new ConflictError('Test error');

      expect(error).toBeInstanceOf(Error);
    });

    it('should maintain proper stack trace', () => {
      const error = new ConflictError('Test error');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('ConflictError');
    });
  });
});