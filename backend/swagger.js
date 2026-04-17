const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: "Fisher's Guidapp API",
      version: '2.0.0',
      description: 'Backend API do Fisher\'s Guidapp — registro de capturas, pontos de pesca, clima e autenticação.',
    },
    servers: [
      {
        url: process.env.RENDER_EXTERNAL_URL || 'http://localhost:3001',
        description: 'Servidor ativo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Catch: {
          type: 'object',
          properties: {
            id:       { type: 'integer', example: 1 },
            species:  { type: 'string',  example: 'Robalo' },
            weight:   { type: 'number',  example: 2.5 },
            length:   { type: 'number',  example: 45 },
            location: { type: 'string',  example: 'Lagoa da Conceição' },
            date:     { type: 'string',  format: 'date', example: '2026-04-17' },
            time:     { type: 'string',  example: '06:30' },
            weather:  { type: 'string',  example: 'Ensolarado' },
            baitUsed: { type: 'string',  example: 'Camarão artificial' },
            photoUrl: { type: 'string',  example: 'https://...' },
          },
        },
        Spot: {
          type: 'object',
          properties: {
            id:        { type: 'integer', example: 1 },
            name:      { type: 'string',  example: 'Pesqueiro Maeda' },
            catches:   { type: 'integer', example: 45 },
            rating:    { type: 'number',  example: 4.8 },
            latitude:  { type: 'number',  example: -23.4892 },
            longitude: { type: 'number',  example: -46.5731 },
          },
        },
        User: {
          type: 'object',
          properties: {
            id:                { type: 'integer', example: 1 },
            name:              { type: 'string',  example: 'João Pescador' },
            email:             { type: 'string',  example: 'joao@email.com' },
            subscription_plan: { type: 'string',  enum: ['free','pro','premium'] },
            created_at:        { type: 'string',  format: 'date-time' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user:  { $ref: '#/components/schemas/User' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Mensagem de erro' },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'],
};

module.exports = swaggerJsdoc(options);
