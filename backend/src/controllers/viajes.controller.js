import { pool } from '../config/db.js';

const CAMPOS = [
  'vehiculo_id', 'conductor_id', 'fecha_salida', 'fecha_llegada',
  'origen', 'destino', 'kilometros', 'observaciones',
];
const valores = (b) => CAMPOS.map((c) => (c === 'observaciones' ? b[c] ?? null : b[c]));

const SELECT_VIAJE = `
  SELECT v.*,
        ve.marca AS vehiculo_marca, ve.modelo AS vehiculo_modelo, ve.patente AS vehiculo_patente,
        c.nombre AS conductor_nombre, c.apellido AS conductor_apellido
  FROM viajes v
  JOIN vehiculos ve ON ve.id = v.vehiculo_id
  JOIN conductores c ON c.id = v.conductor_id`;

const findViaje = async (id) => {
  const [rows] = await pool.query(`${SELECT_VIAJE} WHERE v.id = ?`, [id]);
  return rows[0];
};

// Verifica existencia y licencia vigente. Devuelve { status, message } si hay problema.
const checkReferencias = async ({ vehiculo_id, conductor_id, fecha_salida }) => {
  const [veh] = await pool.query('SELECT id FROM vehiculos WHERE id = ?', [vehiculo_id]);
  if (!veh.length) return { status: 404, message: 'Vehículo no encontrado' };

  const [con] = await pool.query('SELECT fecha_vencimiento_licencia FROM conductores WHERE id = ?', [conductor_id]);
  if (!con.length) return { status: 404, message: 'Conductor no encontrado' };

  if (new Date(con[0].fecha_vencimiento_licencia) < new Date(fecha_salida.slice(0, 10))) {
    return { status: 403, message: 'El conductor tiene la licencia vencida en la fecha de salida' };
  }
  return null;
};

// GET /viajes?vehiculo_id=1&conductor_id=2  (filtros opcionales)
export const getAll = async (req, res) => {
  const where = [];
  const params = [];
  if (req.query.vehiculo_id) { where.push('v.vehiculo_id = ?'); params.push(req.query.vehiculo_id); }
  if (req.query.conductor_id) { where.push('v.conductor_id = ?'); params.push(req.query.conductor_id); }

  const [rows] = await pool.query(
    `${SELECT_VIAJE} ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY v.fecha_salida DESC`,
    params
  );
  res.json(rows);
};

export const getOne = async (req, res) => {
  const viaje = await findViaje(req.params.id);
  if (!viaje) return res.status(404).json({ message: 'Viaje no encontrado' });
  res.json(viaje);
};

export const create = async (req, res) => {
  const problema = await checkReferencias(req.body);
  if (problema) return res.status(problema.status).json({ message: problema.message });

  const [result] = await pool.query(
    `INSERT INTO viajes (${CAMPOS.join(', ')}) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    valores(req.body)
  );
  res.status(201).json(await findViaje(result.insertId));
};

export const update = async (req, res) => {
  if (!(await findViaje(req.params.id))) return res.status(404).json({ message: 'Viaje no encontrado' });

  const problema = await checkReferencias(req.body);
  if (problema) return res.status(problema.status).json({ message: problema.message });

  await pool.query(
    `UPDATE viajes SET ${CAMPOS.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`,
    [...valores(req.body), req.params.id]
  );
  res.json(await findViaje(req.params.id));
};

export const remove = async (req, res) => {
  const [result] = await pool.query('DELETE FROM viajes WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Viaje no encontrado' });
  res.status(204).send();
};
