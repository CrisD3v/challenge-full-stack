import { Pool } from 'pg';

import {
    GetUserProfileUseCase,
    LoginUserUseCase,
    RegisterUserUseCase,
    CreateTaskUseCase,
    UpdateTaskUseCase,
    GetTasksUseCase,
    ToggleTaskCompleteUseCase,
    DeleteTaskUseCase,

} from '../../application/use-cases';
import { CategoryRepository } from '../../domain/repositories/category.repository';
import { TagRepository } from '../../domain/repositories/tag.repository';
import { TaskRepository } from '../../domain/repositories/task.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { AuthController } from '../../presentation/controllers/auth.controller';
import { TaskController } from '../../presentation/controllers/task.controller';
import { config } from '../config/app.config';
import { createDatabasePool } from '../database/connection';
import { IJWTService, JWTService } from '../security/jwt.service';
import { IPasswordHasher, PasswordHasher } from '../security/password-hasher.service';
import { PostgreSQLUserRepository } from '../repositories/postgresql-user.repository';
import { PostgreSQLTaskRepository } from '../repositories/postgresql-task.repository';

/**
 * Contenedor de inyección de dependencias para la aplicación
 * Gestiona la creación y el ciclo de vida de todas las dependencias
 */
export class DependencyContainer {
    private static instance: DependencyContainer;

    // Infrastructure
    private _databasePool: Pool | null = null;
    private _jwtService: IJWTService | null = null;
    private _passwordHasher: IPasswordHasher | null = null;

    // Repositories
    private _userRepository: UserRepository | null = null;
    private _taskRepository: TaskRepository | null = null;
    private _categoryRepository: CategoryRepository | null = null;
    private _tagRepository: TagRepository | null = null;

    // Use Cases
    private _registerUserUseCase: RegisterUserUseCase | null = null;
    private _loginUserUseCase: LoginUserUseCase | null = null;
    private _getUserProfileUseCase: GetUserProfileUseCase | null = null;
    private _createTaskUseCase: CreateTaskUseCase | null = null;
    private _getTasksUseCase: GetTasksUseCase | null = null;
    private _updateTaskUseCase: UpdateTaskUseCase | null = null;
    private _deleteTaskUseCase: DeleteTaskUseCase | null = null;
    private _toggleTaskCompleteUseCase: ToggleTaskCompleteUseCase | null = null;

    // Controllers
    private _authController: AuthController | null = null;
    private _taskController: TaskController | null = null;

    private constructor() { }

    public static getInstance(): DependencyContainer {
        if (!DependencyContainer.instance) {
            DependencyContainer.instance = new DependencyContainer();
        }
        return DependencyContainer.instance;
    }

    // Infrastructure Services
    public getDatabasePool(): Pool {
        if (!this._databasePool) {
            this._databasePool = createDatabasePool();
        }
        return this._databasePool;
    }

    public getJWTService(): IJWTService {
        if (!this._jwtService) {
            this._jwtService = new JWTService(
                config.jwt.secret,
                config.jwt.expiresIn,
                config.jwt.issuer
            );
        }
        return this._jwtService;
    }

    public getPasswordHasher(): IPasswordHasher {
        if (!this._passwordHasher) {
            this._passwordHasher = new PasswordHasher();
        }
        return this._passwordHasher;
    }

    // Repositories
    public getUserRepository(): UserRepository {
        if (!this._userRepository) {
            this._userRepository = new PostgreSQLUserRepository(this.getDatabasePool());
        }
        return this._userRepository;
    }

    public getTaskRepository(): TaskRepository {
        if (!this._taskRepository) {
            this._taskRepository = new PostgreSQLTaskRepository(this.getDatabasePool());
        }
        return this._taskRepository;
    }


    // Use Cases
    public getRegisterUserUseCase(): RegisterUserUseCase {
        if (!this._registerUserUseCase) {
            this._registerUserUseCase = new RegisterUserUseCase(
                this.getUserRepository(),
                this.getPasswordHasher()
            );
        }
        return this._registerUserUseCase;
    }

    public getLoginUserUseCase(): LoginUserUseCase {
        if (!this._loginUserUseCase) {
            this._loginUserUseCase = new LoginUserUseCase(
                this.getUserRepository(),
                this.getPasswordHasher(),
                this.getJWTService()
            );
        }
        return this._loginUserUseCase;
    }

    public getUserProfileUseCase(): GetUserProfileUseCase {
        if (!this._getUserProfileUseCase) {
            this._getUserProfileUseCase = new GetUserProfileUseCase(
                this.getUserRepository()
            );
        }
        return this._getUserProfileUseCase;
    }

    public getCreateTaskUseCase(): CreateTaskUseCase {
        if (!this._createTaskUseCase) {
            this._createTaskUseCase = new CreateTaskUseCase(
                this.getTaskRepository()
            );
        }
        return this._createTaskUseCase;
    }

    public getGetTasksUseCase(): GetTasksUseCase {
        if (!this._getTasksUseCase) {
            this._getTasksUseCase = new GetTasksUseCase(
                this.getTaskRepository()
            );
        }
        return this._getTasksUseCase;
    }

    public getUpdateTaskUseCase(): UpdateTaskUseCase {
        if (!this._updateTaskUseCase) {
            this._updateTaskUseCase = new UpdateTaskUseCase(
                this.getTaskRepository()
            );
        }
        return this._updateTaskUseCase;
    }

    public getDeleteTaskUseCase(): DeleteTaskUseCase {
        if (!this._deleteTaskUseCase) {
            this._deleteTaskUseCase = new DeleteTaskUseCase(
                this.getTaskRepository()
            );
        }
        return this._deleteTaskUseCase;
    }

    public getToggleTaskCompleteUseCase(): ToggleTaskCompleteUseCase {
        if (!this._toggleTaskCompleteUseCase) {
            this._toggleTaskCompleteUseCase = new ToggleTaskCompleteUseCase(
                this.getTaskRepository()
            );
        }
        return this._toggleTaskCompleteUseCase;
    }


    // Controllers
    public getAuthController(): AuthController {
        if (!this._authController) {
            this._authController = new AuthController(
                this.getRegisterUserUseCase(),
                this.getLoginUserUseCase(),
                this.getUserProfileUseCase()
            );
        }
        return this._authController;
    }

    public getTaskController(): TaskController {
        if (!this._taskController) {
            this._taskController = new TaskController(
                this.getCreateTaskUseCase(),
                this.getGetTasksUseCase(),
                this.getUpdateTaskUseCase(),
                this.getDeleteTaskUseCase(),
                this.getToggleTaskCompleteUseCase()
            );
        }
        return this._taskController;
    }

}
