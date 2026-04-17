const express = require('express');
const router = express.Router();
const spotsController = require('../controllers/spotsController');

/**
 * @swagger
 * tags:
 *   name: Spots
 *   description: Pontos de pesca
 */

/**
 * @swagger
 * /api/spots:
 *   get:
 *     summary: Lista todos os pontos de pesca
 *     tags: [Spots]
 *     responses:
 *       200:
 *         description: Lista de pontos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Spot'
 *   post:
 *     summary: Cria novo ponto de pesca
 *     tags: [Spots]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:      { type: string, example: Pesqueiro Maeda }
 *               latitude:  { type: number, example: -23.4892 }
 *               longitude: { type: number, example: -46.5731 }
 *               rating:    { type: number, example: 4.8 }
 *     responses:
 *       201:
 *         description: Ponto criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Spot'
 */
router.get('/', spotsController.getAllSpots);
router.post('/', spotsController.createSpot);

/**
 * @swagger
 * /api/spots/{id}:
 *   get:
 *     summary: Busca ponto por ID
 *     tags: [Spots]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ponto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Spot'
 *       404:
 *         description: Não encontrado
 *   put:
 *     summary: Atualiza ponto de pesca
 *     tags: [Spots]
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
 *             $ref: '#/components/schemas/Spot'
 *     responses:
 *       200:
 *         description: Ponto atualizado
 *   delete:
 *     summary: Remove ponto de pesca
 *     tags: [Spots]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Removido com sucesso
 */
router.get('/:id', spotsController.getSpotById);
router.put('/:id', spotsController.updateSpot);
router.delete('/:id', spotsController.deleteSpot);

module.exports = router;
