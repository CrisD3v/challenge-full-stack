import { NotFoundError } from '../not-found.error';

describe('NotFoundError', () => {
  it('should create a not found error with resource name only', () => {
    const error = new NotFoundError('User');

    expect(error.message).toBe('User not found');
    expect(error.resource).toBe('User');
    expect(error.resourceId).toBeUndefined();
    expect(error.code).toBe('NOT_FOUND');
    expect(error.statusCode).toBe(404);
  });

  it('should create a not found error with resource name and ID', () => {
    const error = new NotFoundError('Task', '123');

    expect(error.message).toBe("Task with id '123' not found");
    expect(error.resource).toBe('Task');
    expect(error.resourceId).toBe('123');
  });

  it('should create error using forResource static method', () => {
    const error = NotFoundError.forResource('Category', 'cat-456');

    expect(error.message).toBe("Category with id 'cat-456' not found");
    expect(error.resource).toBe('Category');
    expect(error.resourceId).toBe('cat-456');
  });

  it('should create error using forResourceType static method', () => {
    const error = NotFoundError.forResourceType('Tag');

    expect(error.message).toBe('Tag not found');
    expect(error.resource).toBe('Tag');
    expect(error.resourceId).toBeUndefined();
  });
});