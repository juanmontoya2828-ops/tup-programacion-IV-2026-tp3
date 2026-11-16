import { param } from 'express-validator';

export const idParam = param('id').isInt({ min: 1 }).withMessage('El id debe ser un entero positivo').toInt();
