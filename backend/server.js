require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const { helmetMiddleware, apiLimiter, authLimiter } = require('./middleware/security');
const catchesRouter = require('./routes/catches');
const spotsRouter = require('./routes/spots');
const weatherRouter = require('./routes/weather');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Segurança ──────────────────────────────────────────────
app.use(helmetMiddleware);

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://heroic-granita-7a1aa3.netlify.app',
  'https://fishingapp-1.onrender.com',
  process.env.FRONTEND_URL,
].filter(Boolean);

const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/[\w-]+\.onrender\.com$/,
  /^https:\/\/[\w-]+\.netlify\.app$/,
];

app.use(cors({
  origin: (origin, callback) => {
    const allowed =
      !origin ||
      ALLOWED_ORIGINS.includes(origin) ||
      ALLOWED_ORIGIN_PATTERNS.some((re) => re.test(origin));
    if (allowed) {
      callback(null, origin || '*');
    } else {
      callback(new Error(`CORS: origem não permitida — ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rate limiting ──────────────────────────────────────────
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// ── Swagger UI (CSP desabilitado para carregar assets inline) ──
app.use('/api/docs', (req, res, next) => {
  res.removeHeader('Content-Security-Policy');
  next();
}, swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "Fisher's Guidapp API",
  swaggerOptions: { persistAuthorization: true }
}));

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
