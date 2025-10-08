import { body, param } from 'express-validator';

export const createTagValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Nombre es requerido y no puede exceder 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-_]+$/)
    .withMessage('Nombre solo puede contener letras, números, espacios, guiones y guiones bajos')
];

export const addTagsToTaskValidation = [
  param('id')
    .isUUID()
    .withMessage('ID de tarea debe ser un UUID válido'),

  body('tagIds')
    .isArray({ min: 1 })
    .withMessage('tagIds debe ser un array con al menos un elemento')
    .custom((value) => {
      if (Array.isArray(value)) {
        for (const id of value) {
          if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
            throw new Error('Todos los IDs de etiquetas deben ser UUIDs válidos');
          }
        }
      }
      return true;
    })
];

export const removeTagsFromTaskValidation = [
  param('id')
    .isUUID()
    .withMessage('ID de tarea debe ser un UUID válido'),

  body('tagIds')
    .isArray({ min: 1 })
    .withMessage('tagIds debe ser un array con al menos un elemento')
    .custom((value) => {
      if (Array.isArray(value)) {
        for (const id of value) {
          if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
            throw new Error('Todos los IDs de etiquetas deben ser UUIDs válidos');
          }
        }
      }
      return true;
    })
];
