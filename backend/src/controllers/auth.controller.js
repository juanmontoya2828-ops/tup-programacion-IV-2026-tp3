import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

const signToken = (user) =>
  jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '4h',
  });

export const register = async (req, res) => {
  const { nombre, email, password } = req.body;

  const [existing] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
  if (existing.length) return res.status(409).json({ message: 'El email ya está registrado' });

  const hash = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
    [nombre, email, hash]
  );
  res.status(201).json({ id: result.insertId, nombre, email });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
  const user = rows[0];
  // Mismo mensaje en ambos casos para no revelar si el email existe
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  res.json({
    token: signToken(user),
    user: { id: user.id, nombre: user.nombre, email: user.email },
  });
};

export const me = (req, res) => res.json(req.user);
