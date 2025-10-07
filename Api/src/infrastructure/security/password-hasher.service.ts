import bcrypt from 'bcrypt';

export interface IPasswordHasher {
    hash(password: string): Promise<string>;
    compare(password: string, hash: string): Promise<boolean>;
}

export class PasswordHasher implements IPasswordHasher {
    private readonly saltRounds = 12;

    async hash(password: string): Promise<string> {
        if (!password || password.trim().length === 0) {
            throw new Error('Password cannot be empty');
        }

        return bcrypt.hash(password, this.saltRounds);
    }

    async compare(password: string, hash: string): Promise<boolean> {
        if (!password || !hash) {
            return false;
        }

        return bcrypt.compare(password, hash);
    }
}