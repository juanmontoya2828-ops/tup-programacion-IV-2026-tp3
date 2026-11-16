import mysql from 'mysql2/promise';
import 'dotenv/config';

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'transporte_db',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true, // fechas como string: '2026-11-14' / '2026-11-14 10:00:00'
});
