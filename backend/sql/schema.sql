CREATE DATABASE IF NOT EXISTS transporte_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE transporte_db;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL, -- hash bcrypt
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehiculos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  marca VARCHAR(50) NOT NULL,
  modelo VARCHAR(50) NOT NULL,
  patente VARCHAR(10) NOT NULL UNIQUE,
  anio SMALLINT UNSIGNED NOT NULL,
  capacidad_carga DECIMAL(10,2) NOT NULL -- en kg
);

CREATE TABLE IF NOT EXISTS conductores (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  numero_documento VARCHAR(15) NOT NULL UNIQUE,
  numero_licencia VARCHAR(30) NOT NULL UNIQUE,
  fecha_alta_licencia DATE NOT NULL,
  fecha_vencimiento_licencia DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS viajes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  vehiculo_id INT UNSIGNED NOT NULL,
  conductor_id INT UNSIGNED NOT NULL,
  fecha_salida DATETIME NOT NULL,
  fecha_llegada DATETIME NOT NULL,
  origen VARCHAR(150) NOT NULL,
  destino VARCHAR(150) NOT NULL,
  kilometros DECIMAL(10,2) NOT NULL,
  observaciones TEXT NULL,
  CONSTRAINT fk_viaje_vehiculo FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id),
  CONSTRAINT fk_viaje_conductor FOREIGN KEY (conductor_id) REFERENCES conductores(id),
  INDEX idx_viaje_vehiculo (vehiculo_id),
  INDEX idx_viaje_conductor (conductor_id)
);
