# Gestión de vehículos, conductores y viajes

Trabajo Práctico N.º 3 de **Programación IV** (Tecnicatura Universitaria en Programación — UTN FRLR). Aplicación web full-stack para registrar los vehículos de una empresa de transporte, sus conductores y los viajes realizados, con consulta del historial, filtros y cálculo del total de kilómetros recorridos por vehículo o por conductor.

- **`backend/`**: API REST con Node.js, Express, MySQL (`mysql2`), `express-validator`, `bcrypt`, `cors` y autenticación con JWT y Passport.
- **`frontend/`**: Aplicación SPA con Vite y React (`react-router-dom` y CSS puro).

---

## Cómo ejecutar

**Requisitos previos:** Node.js 18 o superior, `npm` y MySQL 8.

### 1. Base de datos

Ejecutar el script `backend/sql/schema.sql` desde MySQL Workbench, DBeaver o consola para crear la base `transporte_db` y sus tablas:

```bash
mysql -u root -p < backend/sql/schema.sql