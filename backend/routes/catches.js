const express = require('express');
const router = express.Router();
const catchesController = require('../controllers/catchesController');

/**
 * @swagger
 * tags:
 *   name: Catches
 *   description: Registro de capturas
 */

/**
 * @swagger
 * /api/catches:
 *   get:
 *     summary: Lista todas as capturas
 *     tags: [Catches]
 *     responses:
 *       200:
 *         description: Lista de capturas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Catch'
 */
router.get('/', catchesController.getAllCatches);

/**
 * @swagger
 * /api/catches/{id}:
 *   get:
 *     summary: Busca captura por ID
 *     tags: [Catches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Captura encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Catch'
 *       404:
 *         description: Não encontrada
 */
router.get('/:id', catchesController.getCatchById);

/**
 * @swagger
 * /api/catches:
 *   post:
 *     summary: Registra nova captura
 *     tags: [Catches]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [species, weight, location]
 *             properties:
 *               species:  { type: string, example: Robalo }
 *               weight:   { type: number, example: 2.5 }
 *               length:   { type: number, example: 45 }
 *               location: { type: string, example: Lagoa da Conceição }
 *               weather:  { type: string, example: Ensolarado }
 *               baitUsed: { type: string, example: Camarão artificial }
 *     responses:
 *       201:
 *         description: Captura criada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Catch'
 */
router.post('/', catchesController.createCatch);

/**
 * @swagger
 * /api/catches/{id}:
 *   put:
 *     summary: Atualiza uma captura
 *     tags: [Catches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Catch'
 *     responses:
 *       200:
 *         description: Captura atualizada
 *   delete:
 *     summary: Remove uma captura
 *     tags: [Catches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Removida com sucesso
 */
router.put('/:id', catchesController.updateCatch);
router.delete('/:id', catchesController.deleteCatch);

module.exports = router;
