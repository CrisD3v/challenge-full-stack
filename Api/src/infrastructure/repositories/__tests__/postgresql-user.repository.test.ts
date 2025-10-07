import { Pool, PoolClient } from 'pg';
import { User } from '../../../domain/entities/user';
import { CreateUserDto } from '../../../domain/repositories/types';
import { ConflictError } from '../../../shared/errors/conflict.error';
import { PostgreSQLUserRepository } from '../postgresql-user.repository';

// Mock the logger
jest.mock('../../logging/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn()
  }
}));

describe('PostgreSQLUserRepository', () => {
  let repository: PostgreSQLUserRepository;
  let mockPool: jest.Mocked<Pool>;
  let mockClient: jest.Mocked<PoolClient>;

  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
      release: jest.fn()
    } as any;

    mockPool = {
      connect: jest.fn().mockResolvedValue(mockClient)
    } as any;

    repository = new PostgreSQLUserRepository(mockPool);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      name: 'Test User',
      hashedPassword: 'hashed_password_123'
    };

    const mockUserRow = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      name: 'Test User',
      password_hash: 'hashed_password_123',
      created_at: new Date('2023-01-01T00:00:00Z')
    };

    it('should create user successfully', async () => {
      // Mock email check (no existing user)
      (mockClient.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [] })
        // Mock user creation
        .mockResolvedValueOnce({ rows: [mockUserRow] });

      const result = await repository.create(createUserDto);

      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe(mockUserRow.id);
      expect(result.email).toBe(mockUserRow.email);
      expect(result.name).toBe(mockUserRow.name);
      expect(result.createdAt).toBe(mockUserRow.created_at);

      expect(mockClient.query).toHaveBeenCalledTimes(2);
      expect(mockClient.query).toHaveBeenNthCalledWith(1,
        'SELECT id FROM usuarios WHERE email = $1',
        [createUserDto.email]
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should throw ConflictError when email already exists', async () => {
      // Mock email check (existing user found)
      (mockClient.query as jest.Mock).mockResolvedValueOnce({
        rows: [{ id: 'existing-user-id' }]
      });

      await expect(repository.create(createUserDto))
        .rejects
        .toThrow(ConflictError);

      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should release client on database error', async () => {
      const dbError = new Error('Database connection failed');
      (mockClient.query as jest.Mock).mockRejectedValueOnce(dbError);

      await expect(repository.create(createUserDto))
        .rejects
        .toThrow(dbError);

      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    const email = 'test@example.com';
    const mockUserRow = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      name: 'Test User',
      password_hash: 'hashed_password_123',
      created_at: new Date('2023-01-01T00:00:00Z')
    };

    it('should return user when found', async () => {
      (mockClient.query as jest.Mock).mockResolvedValueOnce({
        rows: [mockUserRow]
      });

      const result = await repository.findByEmail(email);

      expect(result).toBeInstanceOf(User);
      expect(result!.email).toBe(email);
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, email, name, password_hash, created_at'),
        [email]
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should return null when user not found', async () => {
      (mockClient.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const result = await repository.findByEmail(email);

      expect(result).toBeNull();
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should release client on database error', async () => {
      const dbError = new Error('Database error');
      (mockClient.query as jest.Mock).mockRejectedValueOnce(dbError);

      await expect(repository.findByEmail(email))
        .rejects
        .toThrow(dbError);

      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const mockUserRow = {
      id: userId,
      email: 'test@example.com',
      name: 'Test User',
      password_hash: 'hashed_password_123',
      created_at: new Date('2023-01-01T00:00:00Z')
    };

    it('should return user when found', async () => {
      (mockClient.query as jest.Mock).mockResolvedValueOnce({
        rows: [mockUserRow]
      });

      const result = await repository.findById(userId);

      expect(result).toBeInstanceOf(User);
      expect(result!.id).toBe(userId);
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, email, name, password_hash, created_at'),
        [userId]
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should return null when user not found', async () => {
      (mockClient.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const result = await repository.findById(userId);

      expect(result).toBeNull();
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should release client on database error', async () => {
      const dbError = new Error('Database error');
      (mockClient.query as jest.Mock).mockRejectedValueOnce(dbError);

      await expect(repository.findById(userId))
        .rejects
        .toThrow(dbError);

      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('existsByEmail', () => {
    const email = 'test@example.com';

    it('should return true when user exists', async () => {
      (mockClient.query as jest.Mock).mockResolvedValueOnce({
        rows: [{ '?column?': 1 }]
      });

      const result = await repository.existsByEmail(email);

      expect(result).toBe(true);
      expect(mockClient.query).toHaveBeenCalledWith(
        'SELECT 1 FROM usuarios WHERE email = $1 LIMIT 1',
        [email]
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should return false when user does not exist', async () => {
      (mockClient.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const result = await repository.existsByEmail(email);

      expect(result).toBe(false);
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should release client on database error', async () => {
      const dbError = new Error('Database error');
      (mockClient.query as jest.Mock).mockRejectedValueOnce(dbError);

      await expect(repository.existsByEmail(email))
        .rejects
        .toThrow(dbError);

      expect(mockClient.release).toHaveBeenCalled();
    });
  });
});