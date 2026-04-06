const db = require('../config/db');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'supersecret';

async function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'token missing' });

  try {
    const payload = jwt.verify(token, SECRET);
    const user = await db.getAsync('SELECT * FROM users WHERE id = ? AND deletedAt IS NULL', [payload.id]);

    if (!user) return res.status(401).json({ error: 'invalid token' });
    if (user.status === 'inactive') return res.status(403).json({ error: 'account deactivated' });

    req.user = user;
    next();
  } catch (err) {
    res.status(403).json({ error: 'invalid token' });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'unauthorized role' });
    }
    next();
  };
}

module.exports = { authenticate, authorize, SECRET };
