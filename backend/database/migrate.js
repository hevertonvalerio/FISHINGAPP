require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';

console.log('🔎 DATABASE_URL definida:', !!process.env.DATABASE_URL);
console.log('🔎 NODE_ENV:', process.env.NODE_ENV || 'não definido');

if (!process.env.DATABASE_URL && isProduction) {
  console.error('❌ DATABASE_URL não definida! Configure a variável de ambiente no Render.');
  process.exit(1);
}

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    }
  : {
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'fishingapp',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      connectionTimeoutMillis: 5000,
    };

const pool = new Pool(poolConfig);

async function migrate() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  console.log('🗄️  Conectando ao banco...');

  let client;
  try {
    client = await pool.connect();
    console.log('✅ Conectado. Aplicando schema...');

    // Executa statement por statement para melhor diagnóstico
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    for (const stmt of statements) {
      await client.query(stmt);
    }

    console.log('✅ Schema aplicado com sucesso!');
  } catch (err) {
    console.error('❌ Erro na migration:', err.message);
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

migrate();
