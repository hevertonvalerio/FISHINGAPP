const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Helmet - cabeçalhos HTTP seguros
const helmetMiddleware = helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
});

// Rate limiting geral da API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente em 15 minutos.' }
});

// Rate limiting estrito para autenticação (previne brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' }
});

module.exports = { helmetMiddleware, apiLimiter, authLimiter };
