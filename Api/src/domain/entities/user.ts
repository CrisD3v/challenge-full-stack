export class User {
    constructor(
        public readonly id: string,
        public readonly email: string,
        public readonly name: string,
        private readonly hashedPassword: string,
        public readonly createdAt: Date
    ) {
        this.validateEmail(email);
        this.validateNombre(name);
    }

    private validateEmail(email: string): void {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }
    }

    private validateNombre(name: string): void {
        if (!name || name.trim().length === 0) {
            throw new Error('Name cannot be empty');
        }
        if (name.length > 255) {
            throw new Error('Name cannot exceed 255 characters');
        }
    }

    getHashedPassword(): string {
        return this.hashedPassword;
    }

    // Devuelve los datos del usuario sin información sensible
    toPublicData(): { id: string; email: string; name: string; createdAt: Date } {
        return {
            id: this.id,
            email: this.email,
            name: this.name,
            createdAt: this.createdAt
        };
    }

    equals(other: User): boolean {
        return this.id === other.id;
    }
}