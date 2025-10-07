import { UserRepository } from '../../domain/repositories/user.repository';
import { IPasswordHasher } from '../../infrastructure/security/password-hasher.service';
import { ConflictError } from '../../shared/errors/conflict.error';
import { ValidationError } from '../../shared/errors/validation.error';
import { RegisterUserDto, UserProfileDto } from '../dto/auth.dto';

export class RegisterUserUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordHasher: IPasswordHasher
    ) { }

    async execute(dto: RegisterUserDto): Promise<UserProfileDto> {
        // Validar datos de entrada
        this.validateInput(dto);

        // Verificar si existe el usuario
        const existingUser = await this.userRepository.findByEmail(dto.email);
        if (existingUser) {
            throw new ConflictError('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await this.passwordHasher.hash(dto.password);

        // Crear usuario
        const user = await this.userRepository.create({
            email: dto.email,
            name: dto.name,
            hashedPassword
        });

        // Return perfil de usuario sin datos sensibles
        return user.toPublicData();
    }

    private validateInput(dto: RegisterUserDto): void {
        if (!dto.email || dto.email.trim().length === 0) {
            throw new ValidationError('Email is required', 'email');
        }

        if (!dto.name || dto.name.trim().length === 0) {
            throw new ValidationError('Name is required', 'nombre');
        }

        if (!dto.password || dto.password.trim().length === 0) {
            throw new ValidationError('Password is required', 'password');
        }

        if (dto.password.length < 6) {
            throw new ValidationError('Password must be at least 6 characters long', 'password');
        }

        if (dto.name.length > 255) {
            throw new ValidationError('Name cannot exceed 255 characters', 'nombre');
        }

        // La validación del email es manejada por la entidad User
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(dto.email)) {
            throw new ValidationError('Invalid email format', 'email');
        }
    }
}