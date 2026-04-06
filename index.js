const express = require('express');
const cors = require('cors');
const { swaggerUi, swaggerDocs } = require('./src/config/swagger');
require('./src/config/db'); // initialize DB
const routes = require('./src/routes');
const logger = require('./src/middlewares/logger.middleware');

const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

app.use(cors());
app.use(express.json());
app.use(logger);

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocs);
});

// Routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
});
