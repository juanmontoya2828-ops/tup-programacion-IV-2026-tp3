import { body } from 'express-validator';
import { idParam } from './common.js';

const conductorBody = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio').isLength({ max: 100 }),
  body('apellido').trim().notEmpty().withMessage('El apellido es obligatorio').isLength({ max: 100 }),
  body('numero_documento')
    .trim().matches(/^\d{7,9}$/).withMessage('El documento debe tener entre 7 y 9 dígitos'),
  body('numero_licencia')
    .trim().notEmpty().withMessage('El número de licencia es obligatorio').isLength({ max: 30 }),
  body('fecha_alta_licencia')
    .isDate({ format: 'YYYY-MM-DD', strictMode: true }).withMessage('Fecha de alta inválida (YYYY-MM-DD)'),
  body('fecha_vencimiento_licencia')
    .isDate({ format: 'YYYY-MM-DD', strictMode: true }).withMessage('Fecha de vencimiento inválida (YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.fecha_alta_licencia)) {
        throw new Error('El vencimiento debe ser posterior a la fecha de alta');
      }
      return true;
    }),
];

export const idRules = [idParam];
export const createConductorRules = conductorBody;
export const updateConductorRules = [idParam, ...conductorBody];
