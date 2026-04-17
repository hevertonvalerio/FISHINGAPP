const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const db = require('../database/db');
const { generateToken } = require('../middleware/auth');

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Nome é obrigatório.'),
    body('email').isEmail().normalizeEmail().withMessage('Email inválido.'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Senha deve ter no mínimo 6 caracteres.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      const { name, email, password } = req.body;

      const existing = await db.users.findByEmail(email);
      if (existing) {
        return res.status(409).json({ error: 'Email já cadastrado.' });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await db.users.create({ name, email, passwordHash });

      const token = generateToken({ id: user.id, email: user.email, plan: user.subscription_plan });

      res.status(201).json({ token, user });
    } catch (err) {
      console.error('Erro no registro:', err);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Email inválido.'),
    body('password').notEmpty().withMessage('Senha é obrigatória.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      const user = await db.users.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas.' });
      }

      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ error: 'Credenciais inválidas.' });
      }

      const token = generateToken({ id: user.id, email: user.email, plan: user.subscription_plan });

      const { password_hash, ...safeUser } = user;
      res.json({ token, user: safeUser });
    } catch (err) {
      console.error('Erro no login:', err);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }
);

// GET /api/auth/me  (requer token)
router.get('/me', require('../middleware/auth').verifyToken, async (req, res) => {
  try {
    const user = await db.users.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

module.exports = router;
