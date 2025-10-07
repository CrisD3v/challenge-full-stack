import { body } from 'express-validator';

export const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Email debe ser válido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email no puede exceder 255 caracteres'),

  body('name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Nombre es requerido y no puede exceder 255 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Nombre solo puede contener letras y espacios'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Contraseña debe contener al menos una minúscula, una mayúscula y un número')
];

export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Email debe ser válido')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Contraseña es requerida')
];