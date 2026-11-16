import { body } from 'express-validator';

export const registerRules = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio').isLength({ max: 100 }),
  body('email').trim().toLowerCase().isEmail().withMessage('Email invalido'),
  body('password').isString().isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
];

export const loginRules = [
  body('email').trim().toLowerCase().isEmail().withMessage('Email invalido'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria'),
];
