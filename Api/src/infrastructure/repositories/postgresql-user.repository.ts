import { Pool } from 'pg';
import { User } from '../../domain/entities/user';
import { CreateUserDto } from '../../domain/repositories/types';
import { UserRepository } from '../../domain/repositories/user.repository';
import { ConflictError } from '../../shared/errors/conflict.error';
import { logger } from '../logging/logger';

export class PostgreSQLUserRepository implements UserRepository {
    constructor(private readonly db: Pool) { }

    async create(user: CreateUserDto): Promise<User> {
        const client = await this.db.connect();

        try {
            // Verificar si el email ya existe
            const existsResult = await client.query(
                'SELECT id FROM users WHERE email = $1',
                [user.email]
            );

            if (existsResult.rows.length > 0) {
                throw new ConflictError('Email already exists');
            }

            // Insertar nuevo usuario
            const insertQuery = `
        INSERT INTO users (email, name, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id, email, name, password_hash, created_at
      `;

            const result = await client.query(insertQuery, [
                user.email,
                user.name,
                user.hashedPassword
            ]);

            const row = result.rows[0];

            logger.info('User created successfully', {
                userId: row.id,
                email: row.email
            });

            return new User(
                row.id,
                row.email,
                row.name,
                row.password_hash,
                row.created_at
            );
        } catch (error) {
            logger.error('Error creating user', { error, email: user.email });
            throw error;
        } finally {
            client.release();
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        const client = await this.db.connect();

        try {
            const query = `
        SELECT id, email, name, password_hash, created_at
        FROM users
        WHERE email = $1
      `;

            const result = await client.query(query, [email]);

            if (result.rows.length === 0) {
                return null;
            }

            const row = result.rows[0];
            return new User(
                row.id,
                row.email,
                row.name,
                row.password_hash,
                row.created_at
            );
        } catch (error) {
            logger.error('Error finding user by email', { error, email });
            throw error;
        } finally {
            client.release();
        }
    }

    async findById(id: string): Promise<User | null> {
        const client = await this.db.connect();

        try {
            const query = `
        SELECT id, email, name, password_hash, created_at
        FROM users
        WHERE id = $1
      `;

            const result = await client.query(query, [id]);

            if (result.rows.length === 0) {
                return null;
            }

            const row = result.rows[0];
            return new User(
                row.id,
                row.email,
                row.name,
                row.password_hash,
                row.created_at
            );
        } catch (error) {
            logger.error('Error finding user by ID', { error, userId: id });
            throw error;
        } finally {
            client.release();
        }
    }

    async existsByEmail(email: string): Promise<boolean> {
        const client = await this.db.connect();

        try {
            const query = 'SELECT 1 FROM users WHERE email = $1 LIMIT 1';
            const result = await client.query(query, [email]);
            return result.rows.length > 0;
        } catch (error) {
            logger.error('Error checking if user exists by email', { error, email });
            throw error;
        } finally {
            client.release();
        }
    }
}