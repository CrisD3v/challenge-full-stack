import { body, param } from 'express-validator';

export const createCategoryValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Nombre es requerido y no puede exceder 255 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-_]+$/)
    .withMessage('Nombre solo puede contener letras, números, espacios, guiones y guiones bajos'),

  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Color debe ser un código hexadecimal válido (ej: #FF5733)')
];

export const updateCategoryValidation = [
  param('id')
    .isUUID()
    .withMessage('ID de categoría debe ser un UUID válido'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Nombre no puede estar vacío y no puede exceder 255 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-_]+$/)
    .withMessage('Nombre solo puede contener letras, números, espacios, guiones y guiones bajos'),

  body('color')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null) return true;
      if (value && !/^#[0-9A-Fa-f]{6}$/.test(value)) {
        throw new Error('Color debe ser un código hexadecimal válido (ej: #FF5733)');
      }
      return true;
    })
];

export const categoryIdValidation = [
  param('id')
    .isUUID()
    .withMessage('ID de categoría debe ser un UUID válido')
];
