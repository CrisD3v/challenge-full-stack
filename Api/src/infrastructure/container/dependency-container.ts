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
    CreateCategoryUseCase,
    CreateTagUseCase,
    GetCategoriesUseCase,
    GetTagsUseCase,
    DeleteCategoryUseCase,
    UpdateCategoryUseCase,

} from '../../application/use-cases';
import { AddTagsToTaskUseCase } from '../../application/use-cases/add-tags-to-task.use-case';
import { RemoveTagsFromTaskUseCase } from '../../application/use-cases/remove-tags-from-task.use-case';
import { CategoryRepository } from '../../domain/repositories/category.repository';
import { TagRepository } from '../../domain/repositories/tag.repository';
import { TaskRepository } from '../../domain/repositories/task.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { AuthController } from '../../presentation/controllers/auth.controller';
import { TaskController } from '../../presentation/controllers/task.controller';
import { CategoryController } from '../../presentation/controllers/category.controller';
import { TagController } from '../../presentation/controllers/tag.controller';
import { config } from '../config/app.config';
import { createDatabasePool } from '../database/connection';
import { IJWTService, JWTService } from '../security/jwt.service';
import { IPasswordHasher, PasswordHasher } from '../security/password-hasher.service';
import { PostgreSQLUserRepository } from '../repositories/postgresql-user.repository';
import { PostgreSQLTaskRepository } from '../repositories/postgresql-task.repository';
import { PostgreSQLCategoryRepository } from '../repositories/postgresql-category.repository';
import { PostgreSQLTagRepository } from '../repositories/postgresql-tag.repository';

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
    private _createCategoryUseCase: CreateCategoryUseCase | null = null;
    private _getCategoriesUseCase: GetCategoriesUseCase | null = null;
    private _updateCategoryUseCase: UpdateCategoryUseCase | null = null;
    private _deleteCategoryUseCase: DeleteCategoryUseCase | null = null;
    private _createTagUseCase: CreateTagUseCase | null = null;
    private _getTagsUseCase: GetTagsUseCase | null = null;
    private _addTagsToTaskUseCase: AddTagsToTaskUseCase | null = null;
    private _removeTagsFromTaskUseCase: RemoveTagsFromTaskUseCase | null = null;


    // Controllers
    private _authController: AuthController | null = null;
    private _taskController: TaskController | null = null;
    private _categoryController: CategoryController | null = null;
    private _tagController: TagController | null = null;


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

    public getCategoryRepository(): CategoryRepository {
        if (!this._categoryRepository) {
            this._categoryRepository = new PostgreSQLCategoryRepository(this.getDatabasePool());
        }
        return this._categoryRepository;
    }

    public getTagRepository(): TagRepository {
        if (!this._tagRepository) {
            this._tagRepository = new PostgreSQLTagRepository(this.getDatabasePool());
        }
        return this._tagRepository;
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

    public getCreateCategoryUseCase(): CreateCategoryUseCase {
        if (!this._createCategoryUseCase) {
            this._createCategoryUseCase = new CreateCategoryUseCase(
                this.getCategoryRepository()
            );
        }
        return this._createCategoryUseCase;
    }

    public getGetCategoriesUseCase(): GetCategoriesUseCase {
        if (!this._getCategoriesUseCase) {
            this._getCategoriesUseCase = new GetCategoriesUseCase(
                this.getCategoryRepository()
            );
        }
        return this._getCategoriesUseCase;
    }

    public getUpdateCategoryUseCase(): UpdateCategoryUseCase {
        if (!this._updateCategoryUseCase) {
            this._updateCategoryUseCase = new UpdateCategoryUseCase(
                this.getCategoryRepository()
            );
        }
        return this._updateCategoryUseCase;
    }

    public getDeleteCategoryUseCase(): DeleteCategoryUseCase {
        if (!this._deleteCategoryUseCase) {
            this._deleteCategoryUseCase = new DeleteCategoryUseCase(
                this.getCategoryRepository()
            );
        }
        return this._deleteCategoryUseCase;
    }

    public getCreateTagUseCase(): CreateTagUseCase {
        if (!this._createTagUseCase) {
            this._createTagUseCase = new CreateTagUseCase(
                this.getTagRepository()
            );
        }
        return this._createTagUseCase;
    }

    public getGetTagsUseCase(): GetTagsUseCase {
        if (!this._getTagsUseCase) {
            this._getTagsUseCase = new GetTagsUseCase(
                this.getTagRepository()
            );
        }
        return this._getTagsUseCase;
    }

    public getAddTagsToTaskUseCase(): AddTagsToTaskUseCase {
        if (!this._addTagsToTaskUseCase) {
            this._addTagsToTaskUseCase = new AddTagsToTaskUseCase(
                this.getTagRepository(),
                this.getTaskRepository()
            );
        }
        return this._addTagsToTaskUseCase;
    }

    public getRemoveTagsFromTaskUseCase(): RemoveTagsFromTaskUseCase {
        if (!this._removeTagsFromTaskUseCase) {
            this._removeTagsFromTaskUseCase = new RemoveTagsFromTaskUseCase(
                this.getTagRepository(),
                this.getTaskRepository()
            );
        }
        return this._removeTagsFromTaskUseCase;
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

    public getCategoryController(): CategoryController {
        if (!this._categoryController) {
            this._categoryController = new CategoryController(
                this.getCreateCategoryUseCase(),
                this.getGetCategoriesUseCase(),
                this.getUpdateCategoryUseCase(),
                this.getDeleteCategoryUseCase()
            );
        }
        return this._categoryController;
    }

    public getTagController(): TagController {
        if (!this._tagController) {
            this._tagController = new TagController(
                this.getCreateTagUseCase(),
                this.getGetTagsUseCase()
            );
        }
        return this._tagController;
    }


    /**
     * Limpia los recursos al cerrar la aplicación
     */
    public async cleanup(): Promise<void> {
        // Use the database connection singleton to close properly
        const dbConnection = await import('../config/database.config');
        await dbConnection.databaseConnection.closeConnection();
    }

}
