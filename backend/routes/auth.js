const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const db = require('../database/db');
const { generateToken } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticação de usuários
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Cria nova conta
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:     { type: string,  example: João Pescador }
 *               email:    { type: string,  format: email, example: joao@email.com }
 *               password: { type: string,  minLength: 6, example: senha123 }
 *     responses:
 *       201:
 *         description: Conta criada — retorna token JWT
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       409:
 *         description: Email já cadastrado
 *       422:
 *         description: Dados inválidos
 */
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

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Faz login e retorna token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, format: email, example: joao@email.com }
 *               password: { type: string, example: senha123 }
 *     responses:
 *       200:
 *         description: Login bem-sucedido — retorna token JWT
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Credenciais inválidas
 *
 * /api/auth/me:
 *   get:
 *     summary: Retorna dados do usuário autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Token não fornecido ou inválido
 */
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
