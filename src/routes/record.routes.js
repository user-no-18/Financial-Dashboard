const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/record.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { newRecordSchema, updateRecordSchema } = require('../validators/record.validator');

/**
 * @swagger
 * tags:
 *   name: Records
 *   description: Financial records management
 */

/**
 * @swagger
 * /api/records:
 *   post:
 *     summary: Create a financial record (admin only)
 *     tags: [Records]
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type, category, date]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 5000
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               category:
 *                 type: string
 *                 example: Salary
 *               date:
 *                 type: string
 *                 example: "2025-04-01"
 *               notes:
 *                 type: string
 *                 example: Monthly salary
 *     responses:
 *       201:
 *         description: Record created
 */
router.post('/', authenticate, authorize('admin'), validate(newRecordSchema), ctrl.createRecord);

/**
 * @swagger
 * /api/records:
 *   get:
 *     summary: List records with filters (all roles)
 *     tags: [Records]
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdHeader'
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           example: "2025-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           example: "2025-12-31"
 *     responses:
 *       200:
 *         description: List of records
 */
router.get('/', authenticate, authorize('viewer', 'analyst', 'admin'), ctrl.getRecords);

/**
 * @swagger
 * /api/records/{id}:
 *   get:
 *     summary: Get a single record (all roles)
 *     tags: [Records]
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdHeader'
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Record details
 */
router.get('/:id', authenticate, authorize('viewer', 'analyst', 'admin'), ctrl.getRecordById);

/**
 * @swagger
 * /api/records/{id}:
 *   put:
 *     summary: Update a record (admin only)
 *     tags: [Records]
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdHeader'
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Record updated
 */
router.put('/:id', authenticate, authorize('admin'), validate(updateRecordSchema), ctrl.updateRecord);

/**
 * @swagger
 * /api/records/{id}:
 *   delete:
 *     summary: Delete a record (admin only)
 *     tags: [Records]
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdHeader'
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Record deleted
 */
router.delete('/:id', authenticate, authorize('admin'), ctrl.deleteRecord);

module.exports = router;
