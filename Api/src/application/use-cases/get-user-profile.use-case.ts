import { UserRepository } from '../../domain/repositories/user.repository';
import { NotFoundError } from '../../shared/errors/not-found.error';
import { ValidationError } from '../../shared/errors/validation.error';
import { UserProfileDto } from '../dto/auth.dto';

export class GetUserProfileUseCase {
    constructor(
        private readonly userRepository: UserRepository
    ) { }

    async execute(userId: string): Promise<UserProfileDto> {
        // Validar entrada
        this.validateInput(userId);

        // Buscar usuario por ID
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundError('User not found');
        }

        // Return datos del usuario sin informacion sensible
        return user.toPublicData();
    }

    private validateInput(userId: string): void {
        if (!userId || userId.trim().length === 0) {
            throw new ValidationError('User ID is required', 'userId');
        }

        // Validación básica del formato UUID 
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(userId)) {
            throw new ValidationError('Invalid user ID format', 'userId');
        }
    }
}