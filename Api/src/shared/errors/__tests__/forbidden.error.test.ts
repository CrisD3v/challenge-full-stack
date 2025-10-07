import { ForbiddenError } from '../forbidden.error';

describe('ForbiddenError', () => {
  describe('constructor', () => {
    it('should create error with default message', () => {
      const error = new ForbiddenError();

      expect(error.message).toBe('Access to this resource is forbidden');
      expect(error.code).toBe('FORBIDDEN');
      expect(error.statusCode).toBe(403);
      expect(error.name).toBe('ForbiddenError');
      expect(error.resource).toBeUndefined();
      expect(error.action).toBeUndefined();
    });

    it('should create error with custom message', () => {
      const error = new ForbiddenError('Custom forbidden message');

      expect(error.message).toBe('Custom forbidden message');
      expect(error.code).toBe('FORBIDDEN');
      expect(error.statusCode).toBe(403);
    });

    it('should create error with resource and action', () => {
      const error = new ForbiddenError(
        'Cannot access task',
        'task',
        'read'
      );

      expect(error.message).toBe('Cannot access task');
      expect(error.resource).toBe('task');
      expect(error.action).toBe('read');
    });
  });

  describe('resourceOwnership', () => {
    it('should create resource ownership error', () => {
      const error = ForbiddenError.resourceOwnership('task');

      expect(error.message).toBe("You don't have permission to access this task");
      expect(error.resource).toBe('task');
      expect(error.action).toBe('ACCESS');
      expect(error.code).toBe('FORBIDDEN');
      expect(error.statusCode).toBe(403);
    });
  });

  describe('forAction', () => {
    it('should create action-specific forbidden error', () => {
      const error = ForbiddenError.forAction('delete', 'category');

      expect(error.message).toBe("You don't have permission to delete this category");
      expect(error.resource).toBe('category');
      expect(error.action).toBe('delete');
      expect(error.code).toBe('FORBIDDEN');
      expect(error.statusCode).toBe(403);
    });
  });

  describe('inheritance', () => {
    it('should be instance of Error', () => {
      const error = new ForbiddenError('Test error');

      expect(error).toBeInstanceOf(Error);
    });

    it('should maintain proper stack trace', () => {
      const error = new ForbiddenError('Test error');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('ForbiddenError');
    });
  });
});