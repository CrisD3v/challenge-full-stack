import { Router } from 'express';
import { createAuthMiddleware } from '../../infrastructure/middleware/auth.middleware';
import { IJWTService } from '../../infrastructure/security/jwt.service';
import { TagController } from '../controllers/tag.controller';
import { validate } from '../middleware/validation.middleware';
import { createTagValidation } from '../validators/tag.validator';

export const createTagRoutes = (
  tagController: TagController,
  jwtService: IJWTService
): Router => {
  const router = Router();

  // Crear instancias de middleware
  const authMiddleware = createAuthMiddleware(jwtService);

  // GET /api/etiquetas - Obtener todas las etiquetas del usuario autenticado
  router.get(
    '/',
    authMiddleware,
    tagController.getTags
  );

  // POST /api/etiquetas - Crear una nueva etiqueta
  router.post(
    '/',
    authMiddleware,
    validate(createTagValidation),
    tagController.createTag
  );

  return router;
};
