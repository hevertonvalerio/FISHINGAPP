const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');

/**
 * @swagger
 * tags:
 *   name: Weather
 *   description: Condições meteorológicas e marés
 */

/**
 * @swagger
 * /api/weather/current:
 *   get:
 *     summary: Condições climáticas atuais
 *     tags: [Weather]
 *     responses:
 *       200:
 *         description: Dados do clima atual
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 temp:             { type: number, example: 23 }
 *                 windSpeed:        { type: number, example: 12 }
 *                 windDirection:    { type: string, example: NE }
 *                 waveHeight:       { type: number, example: 0.8 }
 *                 pressure:         { type: number, example: 1013 }
 *                 humidity:         { type: number, example: 75 }
 *                 visibility:       { type: number, example: 10 }
 *                 fishingCondition: { type: string, example: Bom }
 *                 sunrise:          { type: string, example: '06:15' }
 */
router.get('/current', weatherController.getCurrentWeather);

/**
 * @swagger
 * /api/weather/forecast:
 *   get:
 *     summary: Previsão para 3 dias
 *     tags: [Weather]
 *     responses:
 *       200:
 *         description: Previsão meteorológica
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 today:    { type: object }
 *                 tomorrow: { type: object }
 *                 dayAfter: { type: object }
 */
router.get('/forecast', weatherController.getForecast);

module.exports = router;
