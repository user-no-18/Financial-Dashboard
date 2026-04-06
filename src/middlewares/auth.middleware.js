const db = require('../config/db');

// JWT later
async function authenticate(req, res, next) {
  const userId = req.headers['userid'];

  if (!userId) {
    return res.status(401).json({ error: 'userid header is missing' });
  }

  try {
    const user = await db.getAsync('SELECT * FROM users WHERE id = ?', [userId]);

    if (!user) {
      return res.status(401).json({ error: 'no user found with that id' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ error: 'this account is deactivated' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('auth check blew up:', err);
    res.status(500).json({ error: 'auth failed' });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `you need to be ${roles.join(' or ')} to do this. you are: ${req.user.role}`,
      });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
