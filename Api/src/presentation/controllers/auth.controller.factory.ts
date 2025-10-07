import { GetUserProfileUseCase } from '../../application/use-cases/get-user-profile.use-case';
import { LoginUserUseCase } from '../../application/use-cases/login-user.use-case';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case';
import { UserRepository } from '../../domain/repositories/user.repository';
import { IJWTService } from '../../infrastructure/security/jwt.service';
import { IPasswordHasher } from '../../infrastructure/security/password-hasher.service';
import { AuthController } from './auth.controller';

export class AuthControllerFactory {
    static create(
        userRepository: UserRepository,
        passwordHasher: IPasswordHasher,
        jwtService: IJWTService
    ): AuthController {
        // Crear use cases
        const registerUserUseCase = new RegisterUserUseCase(
            userRepository,
            passwordHasher
        );

        const loginUserUseCase = new LoginUserUseCase(
            userRepository,
            passwordHasher,
            jwtService
        );

        const getUserProfileUseCase = new GetUserProfileUseCase(
            userRepository
        );

        // Crear y retornar controller
        return new AuthController(
            registerUserUseCase,
            loginUserUseCase,
            getUserProfileUseCase
        );
    }
}