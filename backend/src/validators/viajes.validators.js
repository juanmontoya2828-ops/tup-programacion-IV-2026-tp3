import { body, query } from 'express-validator';
import { idParam } from './common.js';

// Acepta "2026-11-14T10:30" o "2026-11-14 10:30:00" y lo normaliza para MySQL
const toSqlDateTime = (v) => (typeof v === 'string' ? v.replace('T', ' ').replace('Z', '').slice(0, 19) : v);

const viajeBody = [
  body('vehiculo_id').isInt({ min: 1 }).withMessage('vehiculo_id invalido').toInt(),
  body('conductor_id').isInt({ min: 1 }).withMessage('conductor_id invalido').toInt(),
  body('fecha_salida')
    .isISO8601().withMessage('Fecha de salida invalida').customSanitizer(toSqlDateTime),
  body('fecha_llegada')
    .isISO8601().withMessage('Fecha de llegada invalida').customSanitizer(toSqlDateTime)
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.fecha_salida)) {
        throw new Error('La llegada no puede ser anterior a la salida');
      }
      return true;
    }),
  body('origen').trim().notEmpty().withMessage('El origen es obligatorio').isLength({ max: 150 }),
  body('destino').trim().notEmpty().withMessage('El destino es obligatorio').isLength({ max: 150 }),
  body('kilometros').isFloat({ gt: 0 }).withMessage('Los kilometros deben ser mayores a 0').toFloat(),
  body('observaciones').optional({ values: 'null' }).isString().trim().isLength({ max: 1000 }),
];

export const listViajesRules = [
  query('vehiculo_id').optional().isInt({ min: 1 }).withMessage('vehiculo_id invalido').toInt(),
  query('conductor_id').optional().isInt({ min: 1 }).withMessage('conductor_id invalido').toInt(),
];
export const idRules = [idParam];
export const createViajeRules = viajeBody;
export const updateViajeRules = [idParam, ...viajeBody];
