export const notFound = (req, res) => {
  res.status(404).json({ message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
};

export const errorHandler = (err, req, res, next) => {
  // JSON mal formado
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'JSON mal formado' });
  }
  // Errores de MySQL
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'Ya existe un registro con ese valor único (email, patente, documento o licencia)' });
  }
  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({ message: 'No se puede eliminar: el registro tiene viajes asociados' });
  }
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ message: 'El vehículo o conductor indicado no existe' });
  }
  console.error(err);
  res.status(500).json({ message: 'Error interno del servidor' });
};
