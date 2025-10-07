import { UserRepository } from '../../domain/repositories/user.repository';
import { IJWTService } from '../../infrastructure/security/jwt.service';
import { IPasswordHasher } from '../../infrastructure/security/password-hasher.service';
import { UnauthorizedError } from '../../shared/errors/unauthorized.error';
import { ValidationError } from '../../shared/errors/validation.error';
import { LoginDto, LoginResponseDto } from '../dto/auth.dto';

export class LoginUserUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordHasher: IPasswordHasher,
        private readonly jwtService: IJWTService
    ) { }

    async execute(dto: LoginDto): Promise<LoginResponseDto> {
        // Validar entrada
        this.validateInput(dto);

        // Buscar al usuario por Email
        const user = await this.userRepository.findByEmail(dto.email);
        if (!user) {
            throw new UnauthorizedError('Invalid credentials');
        }

        // Verificar contraseña
        const isPasswordValid = await this.passwordHasher.compare(
            dto.password,
            user.getHashedPassword()
        );

        if (!isPasswordValid) {
            throw new UnauthorizedError('Invalid credentials');
        }

        // Generar JWT token
        const token = this.jwtService.generateToken({
            userId: user.id,
            email: user.email
        });

        // Return Usuario y Token
        return {
            user: user.toPublicData(),
            token
        };
    }

    private validateInput(dto: LoginDto): void {
        if (!dto.email || dto.email.trim().length === 0) {
            throw new ValidationError('Email is required', 'email');
        }

        if (!dto.password || dto.password.trim().length === 0) {
            throw new ValidationError('Password is required', 'password');
        }

        // Validación básica del formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(dto.email)) {
            throw new ValidationError('Invalid email format', 'email');
        }
    }
}