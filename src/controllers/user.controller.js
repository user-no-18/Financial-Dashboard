const db = require('../config/db');
const jwt = require('jsonwebtoken');
const { SECRET } = require('../middlewares/auth.middleware');

async function login(req, res) {
  const { email } = req.body;
  try {
    const user = await db.getAsync('SELECT * FROM users WHERE email = ? AND deletedAt IS NULL', [email]);
    if (!user) return res.status(401).json({ error: 'invalid credentials' });
    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '1h' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createUser(req, res) {
  const { name, email, role } = req.body;
  const existing = await db.getAsync('SELECT id FROM users WHERE email = ? AND deletedAt IS NULL', [email]);
  if (existing) return res.status(409).json({ error: 'email already taken' });

  try {
    const result = await db.runAsync('INSERT INTO users (name, email, role) VALUES (?, ?, ?)', [name, email, role]);
    res.status(201).json({ id: result.lastID, name, email, role, status: 'active' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getUsers(req, res) {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  try {
    const users = await db.allAsync('SELECT * FROM users WHERE deletedAt IS NULL AND name LIKE ? LIMIT ? OFFSET ?', [`%${search}%`, limit, offset]);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'could not fetch users' });
  }
}

async function getUserById(req, res) {
  try {
    const user = await db.getAsync('SELECT * FROM users WHERE id = ? AND deletedAt IS NULL', [req.params.id]);
    if (!user) return res.status(404).json({ error: 'user not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateRole(req, res) {
  const { role } = req.body;
  const id = req.params.id;

  try {
    const u = await db.getAsync('SELECT * FROM users WHERE id = ?', [id]);
    if (!u) return res.status(404).json({ error: 'user not found' });

    await db.runAsync('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    res.json({ message: 'role updated', id: u.id, role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// TODO: maybe log who changed the status and when
async function updateStatus(req, res) {
  const { status } = req.body;

  try {
    const u = await db.getAsync('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!u) return res.status(404).json({ error: 'user not found' });

    await db.runAsync('UPDATE users SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ id: u.id, status });
  } catch (err) {
    console.error('updateStatus error:', err);
    res.status(500).json({ error: 'failed to update status' });
  }
}

async function deleteUser(req, res) {
  try {
    const u = await db.getAsync('SELECT id FROM users WHERE id = ? AND deletedAt IS NULL', [req.params.id]);
    if (!u) return res.status(404).json({ error: 'user not found' });

    await db.runAsync("UPDATE records SET deletedAt = CURRENT_TIMESTAMP WHERE userId = ?", [req.params.id]);
    await db.runAsync("UPDATE users SET deletedAt = CURRENT_TIMESTAMP WHERE id = ?", [req.params.id]);

    res.json({ message: 'deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { login, createUser, getUsers, getUserById, updateRole, updateStatus, deleteUser };
