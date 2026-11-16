import { pool } from '../config/db.js';

const CAMPOS = [
  'nombre', 'apellido', 'numero_documento', 'numero_licencia',
  'fecha_alta_licencia', 'fecha_vencimiento_licencia',
];
const valores = (b) => CAMPOS.map((c) => b[c]);

const findConductor = async (id) => {
  const [rows] = await pool.query('SELECT * FROM conductores WHERE id = ?', [id]);
  return rows[0];
};

export const getAll = async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM conductores ORDER BY apellido, nombre');
  res.json(rows);
};

export const getOne = async (req, res) => {
  const conductor = await findConductor(req.params.id);
  if (!conductor) return res.status(404).json({ message: 'Conductor no encontrado' });
  res.json(conductor);
};

export const create = async (req, res) => {
  const [result] = await pool.query(
    `INSERT INTO conductores (${CAMPOS.join(', ')}) VALUES (?, ?, ?, ?, ?, ?)`,
    valores(req.body)
  );
  res.status(201).json(await findConductor(result.insertId));
};

export const update = async (req, res) => {
  const [result] = await pool.query(
    `UPDATE conductores SET ${CAMPOS.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`,
    [...valores(req.body), req.params.id]
  );
  if (!result.affectedRows) return res.status(404).json({ message: 'Conductor no encontrado' });
  res.json(await findConductor(req.params.id));
};

export const remove = async (req, res) => {
  const [result] = await pool.query('DELETE FROM conductores WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Conductor no encontrado' });
  res.status(204).send();
};

// Historial de viajes del conductor
export const getViajes = async (req, res) => {
  if (!(await findConductor(req.params.id))) return res.status(404).json({ message: 'Conductor no encontrado' });
  const [rows] = await pool.query(
    `SELECT v.*, ve.marca AS vehiculo_marca, ve.modelo AS vehiculo_modelo, ve.patente AS vehiculo_patente
    FROM viajes v JOIN vehiculos ve ON ve.id = v.vehiculo_id
    WHERE v.conductor_id = ? ORDER BY v.fecha_salida DESC`,
    [req.params.id]
  );
  res.json(rows);
};

// Total de kilómetros recorridos por el conductor
export const getKilometros = async (req, res) => {
  if (!(await findConductor(req.params.id))) return res.status(404).json({ message: 'Conductor no encontrado' });
  const [[totales]] = await pool.query(
    'SELECT COALESCE(SUM(kilometros), 0) AS total_kilometros, COUNT(*) AS cantidad_viajes FROM viajes WHERE conductor_id = ?',
    [req.params.id]
  );
  res.json({ conductor_id: req.params.id, ...totales, total_kilometros: Number(totales.total_kilometros) });
};
