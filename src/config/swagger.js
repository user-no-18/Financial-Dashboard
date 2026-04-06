const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Finance Dashboard API',
      version: '1.0.0',
      description: 'A simple finance dashboard backend with role-based access',
    },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      parameters: {
        UserIdHeader: {
          in: 'header',
          name: 'userid',
          required: true,
          schema: { type: 'integer' },
          description: 'ID of the logged-in user (simulates auth)',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerUi, swaggerDocs };
