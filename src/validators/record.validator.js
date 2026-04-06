const { z } = require('zod');

// schema for creating a new record
const newRecordSchema = z.object({
  amount: z.number().positive('amount must be positive'),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'category is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date format should be YYYY-MM-DD'),
  notes: z.string().optional().default(''),
});

const updateRecordSchema = z.object({
  amount: z.number().positive().optional(),
  type: z.enum(['income', 'expense']).optional(),
  category: z.string().min(1).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: z.string().optional(),
});

module.exports = { newRecordSchema, updateRecordSchema };
