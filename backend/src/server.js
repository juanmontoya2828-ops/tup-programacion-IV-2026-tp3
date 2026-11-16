import app from './app.js';
import { pool } from './config/db.js';

const PORT = process.env.PORT || 3000;

if (!process.env.JWT_SECRET) {
  console.error('Falta JWT_SECRET en el archivo .env');
  process.exit(1);
}

try {
  await pool.query('SELECT 1');
  console.log('Conexión a MySQL OK');
} catch (err) {
  console.error('No se pudo conectar a MySQL:', err.message);
  process.exit(1);
}

app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}`));
