import { body, param, query } from 'express-validator';

const priorityValues = ['baja', 'media', 'alta'];
const sortFields = ['creado_en', 'fecha_vencimiento', 'prioridad', 'titulo'];
const sortDirections = ['asc', 'desc'];

export const createTaskValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Título es requerido y no puede exceder 255 caracteres'),

  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Descripción no puede exceder 1000 caracteres'),

  body('priority')
    .optional()
    .isIn(priorityValues)
    .withMessage(`Prioridad debe ser uno de: ${priorityValues.join(', ')}`),

  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de vencimiento debe ser una fecha válida en formato ISO 8601')
    .custom((value) => {
      if (value && new Date(value) <= new Date()) {
        throw new Error('Fecha de vencimiento debe ser en el futuro');
      }
      return true;
    }),

  body('categoryId')
    .optional()
    .isUUID()
    .withMessage('ID de categoría debe ser un UUID válido'),

  body('tagsId')
    .optional()
    .isArray()
    .withMessage('Etiquetas debe ser un array')
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

export const updateTaskValidation = [
  param('id')
    .isUUID()
    .withMessage('ID de tarea debe ser un UUID válido'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Título no puede estar vacío y no puede exceder 255 caracteres'),

  body('description')
    .optional({ nullable: true })
    .isLength({ max: 1000 })
    .withMessage('Descripción no puede exceder 1000 caracteres'),

  body('priority')
    .optional()
    .isIn(priorityValues)
    .withMessage(`Prioridad debe ser uno de: ${priorityValues.join(', ')}`),

  body('dueDate')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null) return true;
      if (value && !Date.parse(value)) {
        throw new Error('Fecha de vencimiento debe ser una fecha válida en formato ISO 8601');
      }
      if (value && new Date(value) <= new Date()) {
        throw new Error('Fecha de vencimiento debe ser en el futuro');
      }
      return true;
    }),

  body('categoryId')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null) return true;
      if (value && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
        throw new Error('ID de categoría debe ser un UUID válido');
      }
      return true;
    }),

  body('tagsId')
    .optional()
    .isArray()
    .withMessage('Etiquetas debe ser un array')
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

export const getTasksValidation = [
  query('completed')
    .optional()
    .isBoolean()
    .withMessage('Completada debe ser true o false'),

  query('category')
    .optional()
    .isUUID()
    .withMessage('Categoría debe ser un UUID válido'),

  query('priority')
    .optional()
    .isIn(priorityValues)
    .withMessage(`Prioridad debe ser uno de: ${priorityValues.join(', ')}`),

  query('dueDate.desde')
    .optional()
    .isISO8601()
    .withMessage('Fecha desde debe ser una fecha válida en formato ISO 8601'),

  query('dueDate.hasta')
    .optional()
    .isISO8601()
    .withMessage('Fecha hasta debe ser una fecha válida en formato ISO 8601'),

  query('search')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Búsqueda no puede exceder 255 caracteres'),

  query('tags')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        // Single tag ID
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
          throw new Error('ID de etiqueta debe ser un UUID válido');
        }
      } else if (Array.isArray(value)) {
        // Multiple tag IDs
        for (const id of value) {
          if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
            throw new Error('Todos los IDs de etiquetas deben ser UUIDs válidos');
          }
        }
      }
      return true;
    }),

  query('order')
    .optional()
    .isIn(sortFields)
    .withMessage(`Ordenar debe ser uno de: ${sortFields.join(', ')}`),

  query('direction')
    .optional()
    .isIn(sortDirections)
    .withMessage(`Dirección debe ser uno de: ${sortDirections.join(', ')}`),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Límite debe ser un número entre 1 y 100'),

  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset debe ser un número mayor o igual a 0')
];

export const taskIdValidation = [
  param('id')
    .isUUID()
    .withMessage('ID de tarea debe ser un UUID válido')
];
