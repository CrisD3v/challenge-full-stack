import { ValidationError } from '../validation.error';

describe('ValidationError', () => {
  it('should create a validation error with message', () => {
    const error = new ValidationError('Invalid input');

    expect(error.message).toBe('Invalid input');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe('ValidationError');
  });

  it('should create a validation error with field', () => {
    const error = new ValidationError('Invalid email', 'email');

    expect(error.message).toBe('Invalid email');
    expect(error.field).toBe('email');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.statusCode).toBe(400);
  });

  it('should create a validation error with details', () => {
    const details = { email: 'Invalid format', name: 'Too short' };
    const error = new ValidationError('Multiple validation errors', undefined, details);

    expect(error.message).toBe('Multiple validation errors');
    expect(error.details).toEqual(details);
    expect(error.field).toBeUndefined();
  });

  it('should create field-specific error using static method', () => {
    const error = ValidationError.forField('username', 'is required');

    expect(error.message).toBe("Validation failed for field 'username': is required");
    expect(error.field).toBe('username');
    expect(error.code).toBe('VALIDATION_ERROR');
  });

  it('should create error with details using static method', () => {
    const details = { email: 'Invalid', password: 'Too weak' };
    const error = ValidationError.withDetails('Validation failed', details);

    expect(error.message).toBe('Validation failed');
    expect(error.details).toEqual(details);
    expect(error.field).toBeUndefined();
  });
});