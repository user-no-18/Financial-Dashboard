const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dashboard.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Analytics and summary APIs
 */

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Total income, expenses, net balance (analyst & admin)
 *     tags: [Dashboard]
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdHeader'
 *     responses:
 *       200:
 *         description: Summary data
 */
router.get('/summary', authenticate, authorize('analyst', 'admin'), ctrl.getSummary);

/**
 * @swagger
 * /api/dashboard/category-totals:
 *   get:
 *     summary: Category-wise totals (analyst & admin)
 *     tags: [Dashboard]
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdHeader'
 *     responses:
 *       200:
 *         description: Category breakdown
 */
router.get('/category-totals', authenticate, authorize('analyst', 'admin'), ctrl.getCategoryTotals);

/**
 * @swagger
 * /api/dashboard/recent:
 *   get:
 *     summary: Last 10 transactions (analyst & admin)
 *     tags: [Dashboard]
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdHeader'
 *     responses:
 *       200:
 *         description: Recent transactions
 */
router.get('/recent', authenticate, authorize('analyst', 'admin'), ctrl.getRecentActivity);

/**
 * @swagger
 * /api/dashboard/monthly-trends:
 *   get:
 *     summary: Monthly income vs expense trends (analyst & admin)
 *     tags: [Dashboard]
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdHeader'
 *     responses:
 *       200:
 *         description: Monthly trend data
 */
router.get('/monthly-trends', authenticate, authorize('analyst', 'admin'), ctrl.getMonthlyTrends);

/**
 * @swagger
 * /api/dashboard/weekly-trends:
 *   get:
 *     summary: Weekly income vs expense trends (analyst & admin)
 *     tags: [Dashboard]
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdHeader'
 *     responses:
 *       200:
 *         description: Weekly trend data
 */
router.get('/weekly-trends', authenticate, authorize('analyst', 'admin'), ctrl.getWeeklyTrends);

module.exports = router;
