import { Router } from 'express';
import { createAuthMiddleware } from '../../infrastructure/middleware/auth.middleware';
import { IJWTService } from '../../infrastructure/security/jwt.service';
import { CategoryController } from '../controllers/category.controller';
import { validate } from '../middleware/validation.middleware';
import {
  categoryIdValidation,
  createCategoryValidation,
  updateCategoryValidation
} from '../validators/category.validator';

export const createCategoryRoutes = (
  categoryController: CategoryController,
  jwtService: IJWTService
): Router => {
  const router = Router();

  // Crear instancias de middleware
  const authMiddleware = createAuthMiddleware(jwtService);

  // GET /api/categorias - Obtener todas las categorías del usuario autenticado
  router.get(
    '/',
    authMiddleware,
    categoryController.getCategories
  );

  // POST /api/categorias - Crear una nueva categoría
  router.post(
    '/',
    authMiddleware,
    validate(createCategoryValidation),
    categoryController.createCategory
  );

  // PUT /api/categorias/:id - Actualizar una categoría
  router.put(
    '/:id',
    authMiddleware,
    validate(updateCategoryValidation),
    categoryController.updateCategory
  );

  // DELETE /api/categorias/:id - Eliminar una categoría
  router.delete(
    '/:id',
    authMiddleware,
    validate(categoryIdValidation),
    categoryController.deleteCategory
  );

  return router;
};
