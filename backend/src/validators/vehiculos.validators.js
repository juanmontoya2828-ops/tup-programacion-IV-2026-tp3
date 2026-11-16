import { body } from 'express-validator';
import { idParam } from './common.js';

const anioMax = new Date().getFullYear() + 1;

const vehiculoBody = [
  body('marca').trim().notEmpty().withMessage('La marca es obligatoria').isLength({ max: 50 }),
  body('modelo').trim().notEmpty().withMessage('El modelo es obligatorio').isLength({ max: 50 }),
  body('patente')
    .trim().toUpperCase()
    .matches(/^([A-Z]{3}\s?\d{3}|[A-Z]{2}\s?\d{3}\s?[A-Z]{2})$/)
    .withMessage('Patente inválida (ej: ABC123 o AB123CD)'),
  body('anio').isInt({ min: 1950, max: anioMax }).withMessage(`El año debe estar entre 1950 y ${anioMax}`).toInt(),
  body('capacidad_carga').isFloat({ gt: 0 }).withMessage('La capacidad de carga debe ser mayor a 0').toFloat(),
];

export const idRules = [idParam];
export const createVehiculoRules = vehiculoBody;
export const updateVehiculoRules = [idParam, ...vehiculoBody];
