import { pool } from '../config/db.js';

const CAMPOS = ['marca', 'modelo', 'patente', 'anio', 'capacidad_carga'];
const valores = (b) => CAMPOS.map((c) => b[c]);

const findVehiculo = async (id) => {
  const [rows] = await pool.query('SELECT * FROM vehiculos WHERE id = ?', [id]);
  return rows[0];
};

export const getAll = async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM vehiculos ORDER BY id DESC');
  res.json(rows);
};

export const getOne = async (req, res) => {
  const vehiculo = await findVehiculo(req.params.id);
  if (!vehiculo) return res.status(404).json({ message: 'Vehiculo no encontrado' });
  res.json(vehiculo);
};

export const create = async (req, res) => {
  const [result] = await pool.query(
    `INSERT INTO vehiculos (${CAMPOS.join(', ')}) VALUES (?, ?, ?, ?, ?)`,
    valores(req.body)
  );
  res.status(201).json(await findVehiculo(result.insertId));
};

export const update = async (req, res) => {
  const [result] = await pool.query(
    `UPDATE vehiculos SET ${CAMPOS.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`,
    [...valores(req.body), req.params.id]
  );
  if (!result.affectedRows) return res.status(404).json({ message: 'Vehiculo no encontrado' });
  res.json(await findVehiculo(req.params.id));
};

export const remove = async (req, res) => {
  const [result] = await pool.query('DELETE FROM vehiculos WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Vehiculo no encontrado' });
  res.status(204).send();
};

// Historial de viajes del vehiculo
export const getViajes = async (req, res) => {
  if (!(await findVehiculo(req.params.id))) return res.status(404).json({ message: 'Vehiculo no encontrado' });
  const [rows] = await pool.query(
    `SELECT v.*, c.nombre AS conductor_nombre, c.apellido AS conductor_apellido
    FROM viajes v JOIN conductores c ON c.id = v.conductor_id
    WHERE v.vehiculo_id = ? ORDER BY v.fecha_salida DESC`,
    [req.params.id]
  );
  res.json(rows);
};

// Total de kilómetros recorridos por el vehiculo
export const getKilometros = async (req, res) => {
  if (!(await findVehiculo(req.params.id))) return res.status(404).json({ message: 'Vehiculo no encontrado' });
  const [[totales]] = await pool.query(
    'SELECT COALESCE(SUM(kilometros), 0) AS total_kilometros, COUNT(*) AS cantidad_viajes FROM viajes WHERE vehiculo_id = ?',
    [req.params.id]
  );
  res.json({ vehiculo_id: req.params.id, ...totales, total_kilometros: Number(totales.total_kilometros) });
};
