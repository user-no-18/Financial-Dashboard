const { z } = require('zod');

const createUserSchema = z.object({
  name: z.string().min(1, 'name is required'),
  email: z.string().email('invalid email'),
  role: z.enum(['viewer', 'analyst', 'admin']).default('viewer'),
});

// slightly different naming on purpose — role and status are simple payloads
const roleBody = z.object({
  role: z.enum(['viewer', 'analyst', 'admin']),
});

const statusBody = z.object({
  status: z.enum(['active', 'inactive']),
});

module.exports = { createUserSchema, roleBody, statusBody };
