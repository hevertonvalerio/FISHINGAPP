require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { helmetMiddleware, apiLimiter, authLimiter } = require('./middleware/security');
const catchesRouter = require('./routes/catches');
const spotsRouter = require('./routes/spots');
const weatherRouter = require('./routes/weather');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Segurança ──────────────────────────────────────────────
app.use(helmetMiddleware);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rate limiting ──────────────────────────────────────────
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// ── Rotas ──────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/catches', catchesRouter);
app.use('/api/spots', spotsRouter);
app.use('/api/weather', weatherRouter);

// ── Health check ───────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 handler ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Rota não encontrada: ${req.method} ${req.path}` });
});

// ── Error handler ──────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

app.listen(PORT, () => {
  console.log(`🎣 Backend rodando na porta ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

module.exports = app;
