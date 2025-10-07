import { UnauthorizedError } from '../unauthorized.error';

describe('UnauthorizedError', () => {
  it('should create an unauthorized error with default message', () => {
    const error = new UnauthorizedError();

    expect(error.message).toBe('Unauthorized access');
    expect(error.code).toBe('UNAUTHORIZED');
    expect(error.statusCode).toBe(401);
    expect(error.reason).toBeUndefined();
  });

  it('should create an unauthorized error with custom message and reason', () => {
    const error = new UnauthorizedError('Access denied', 'INVALID_TOKEN');

    expect(error.message).toBe('Access denied');
    expect(error.reason).toBe('INVALID_TOKEN');
  });

  it('should create invalid credentials error using static method', () => {
    const error = UnauthorizedError.invalidCredentials();

    expect(error.message).toBe('Invalid credentials provided');
    expect(error.reason).toBe('INVALID_CREDENTIALS');
  });

  it('should create missing token error using static method', () => {
    const error = UnauthorizedError.missingToken();

    expect(error.message).toBe('Authentication token is required');
    expect(error.reason).toBe('MISSING_TOKEN');
  });

  it('should create invalid token error using static method', () => {
    const error = UnauthorizedError.invalidToken();

    expect(error.message).toBe('Invalid or expired authentication token');
    expect(error.reason).toBe('INVALID_TOKEN');
  });

  it('should create insufficient permissions error using static method', () => {
    const error = UnauthorizedError.insufficientPermissions();

    expect(error.message).toBe('Insufficient permissions to access this resource');
    expect(error.reason).toBe('INSUFFICIENT_PERMISSIONS');
  });
});