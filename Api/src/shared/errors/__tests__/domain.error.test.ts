import { DomainError } from '../domain.error';

// Create a concrete implementation for testing
class TestDomainError extends DomainError {
  constructor(message: string, code: string = 'TEST_ERROR', statusCode: number = 500) {
    super(message, code, statusCode);
  }
}

describe('DomainError', () => {
  describe('constructor', () => {
    it('should create error with default status code', () => {
      const error = new TestDomainError('Test error', 'TEST_CODE');

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('TestDomainError');
    });

    it('should create error with custom status code', () => {
      const error = new TestDomainError('Test error', 'TEST_CODE', 400);

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.statusCode).toBe(400);
    });

    it('should set proper error name', () => {
      const error = new TestDomainError('Test error');

      expect(error.name).toBe('TestDomainError');
    });
  });

  describe('inheritance', () => {
    it('should be instance of Error', () => {
      const error = new TestDomainError('Test error');

      expect(error).toBeInstanceOf(Error);
    });

    it('should maintain proper stack trace', () => {
      const error = new TestDomainError('Test error');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('TestDomainError');
    });
  });

  describe('error properties', () => {
    it('should have all required properties', () => {
      const error = new TestDomainError('Test message', 'TEST_CODE', 422);

      expect(error).toHaveProperty('message', 'Test message');
      expect(error).toHaveProperty('code', 'TEST_CODE');
      expect(error).toHaveProperty('statusCode', 422);
      expect(error).toHaveProperty('name', 'TestDomainError');
      expect(error).toHaveProperty('stack');
    });
  });
});