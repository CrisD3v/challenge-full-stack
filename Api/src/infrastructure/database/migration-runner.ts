import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

export interface MigrationResult {
    version: string;
    executed: boolean;
    error?: string;
}

export class MigrationRunner {
    private pool: Pool;
    private migrationsDir: string;

    constructor(pool: Pool, migrationsDir?: string) {
        this.pool = pool;
        this.migrationsDir = migrationsDir || path.join(__dirname, 'migrations');
    }

    /**
     * Inicializar la tabla de seguimiento de migrations
     */
    async initializeMigrationsTable(): Promise<void> {
        await this.pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    }

    /**
     * Obtener lista de migrations ejecutadas
     */
    async getExecutedMigrations(): Promise<string[]> {
        const { rows } = await this.pool.query(
            'SELECT version FROM schema_migrations ORDER BY version'
        );
        return rows.map(row => row.version);
    }

    /**
     * Obtener lista de archivos de migration disponibles
     */
    getMigrationFiles(): string[] {
        if (!fs.existsSync(this.migrationsDir)) {
            return [];
        }

        return fs.readdirSync(this.migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort();
    }

    /**
     * Obtener migrations pendientes (aún no ejecutadas)
     */
    async getPendingMigrations(): Promise<string[]> {
        const executedMigrations = await this.getExecutedMigrations();
        const executedSet = new Set(executedMigrations);

        return this.getMigrationFiles()
            .filter(file => {
                const version = path.basename(file, '.sql');
                return !executedSet.has(version);
            });
    }

    /**
     * Ejecutar un archivo de migration individual
     */
    async executeMigration(filename: string): Promise<MigrationResult> {
        const version = path.basename(filename, '.sql');
        const migrationPath = path.join(this.migrationsDir, filename);

        try {
            // Verificar si el archivo de migration existe
            if (!fs.existsSync(migrationPath)) {
                throw new Error(`Migration file not found: ${filename}`);
            }

            // Leer SQL de migration
            const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

            // Ejecutar migration en una transacción
            const client = await this.pool.connect();
            try {
                await client.query('BEGIN');

                // Ejecutar el SQL de migration
                await client.query(migrationSQL);

                // Registrar la migration como ejecutada
                await client.query(
                    'INSERT INTO schema_migrations (version) VALUES ($1)',
                    [version]
                );

                await client.query('COMMIT');

                return {
                    version,
                    executed: true
                };
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
        } catch (error) {
            return {
                version,
                executed: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Ejecutar todas las migrations pendientes
     */
    async runPendingMigrations(): Promise<MigrationResult[]> {
        await this.initializeMigrationsTable();

        const pendingMigrations = await this.getPendingMigrations();
        const results: MigrationResult[] = [];

        for (const filename of pendingMigrations) {
            const result = await this.executeMigration(filename);
            results.push(result);

            // Detenerse en el primer error
            if (!result.executed) {
                break;
            }
        }

        return results;
    }

    /**
     * Verificar si la base de datos está actualizada
     */
    async isDatabaseUpToDate(): Promise<boolean> {
        const pendingMigrations = await this.getPendingMigrations();
        return pendingMigrations.length === 0;
    }

    /**
     * Obtener información del estado de migrations
     */
    async getMigrationStatus(): Promise<{
        totalMigrations: number;
        executedMigrations: number;
        pendingMigrations: number;
        isUpToDate: boolean;
    }> {
        const allMigrations = this.getMigrationFiles();
        const executedMigrations = await this.getExecutedMigrations();
        const pendingMigrations = await this.getPendingMigrations();

        return {
            totalMigrations: allMigrations.length,
            executedMigrations: executedMigrations.length,
            pendingMigrations: pendingMigrations.length,
            isUpToDate: pendingMigrations.length === 0
        };
    }
}