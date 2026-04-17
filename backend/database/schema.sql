-- Database Schema for PostgreSQL
-- Execute: psql -U postgres -d fishingapp -f schema.sql

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  subscription_plan VARCHAR(20) DEFAULT 'free' CHECK (subscription_plan IN ('free','pro','premium')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS catches (
  id SERIAL PRIMARY KEY,
  species VARCHAR(100) NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  length DECIMAL(5,2) NOT NULL DEFAULT 0,
  location VARCHAR(200) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  weather VARCHAR(100),
  bait_used VARCHAR(150),
  photo_url TEXT,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fishing_spots (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  catches_count INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0.0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS weather_data (
  id SERIAL PRIMARY KEY,
  temp DECIMAL(4,1),
  wind_speed INTEGER,
  wind_direction VARCHAR(10),
  wave_height DECIMAL(3,1),
  pressure INTEGER,
  humidity INTEGER,
  visibility INTEGER,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refresh tokens para revogação de sessões
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_catches_date ON catches(date DESC);
CREATE INDEX IF NOT EXISTS idx_catches_location ON catches(location);
CREATE INDEX IF NOT EXISTS idx_catches_user ON catches(user_id);
CREATE INDEX IF NOT EXISTS idx_spots_rating ON fishing_spots(rating DESC);
CREATE INDEX IF NOT EXISTS idx_weather_recorded ON weather_data(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);

-- Dados de exemplo (apenas se a tabela estiver vazia)
INSERT INTO fishing_spots (name, latitude, longitude, catches_count, rating)
SELECT 'Pesqueiro Maeda', -23.4892, -46.5731, 45, 4.8
WHERE NOT EXISTS (SELECT 1 FROM fishing_spots WHERE name = 'Pesqueiro Maeda');

INSERT INTO fishing_spots (name, latitude, longitude, catches_count, rating)
SELECT 'Represa Billings', -23.7833, -46.5667, 38, 4.6
WHERE NOT EXISTS (SELECT 1 FROM fishing_spots WHERE name = 'Represa Billings');

INSERT INTO fishing_spots (name, latitude, longitude, catches_count, rating)
SELECT 'Represa Guarapiranga', -23.7167, -46.7333, 32, 4.5
WHERE NOT EXISTS (SELECT 1 FROM fishing_spots WHERE name = 'Represa Guarapiranga');
