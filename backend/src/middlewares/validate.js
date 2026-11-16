import { validationResult } from 'express-validator';

// Corta la request con 400 si alguna validación falló.
export const validate = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({
      message: 'Datos inválidos',
      errors: result.array().map((e) => ({ campo: e.path, mensaje: e.msg })),
    });
  }
  next();
};
