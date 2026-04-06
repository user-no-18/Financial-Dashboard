const db = require('../config/db');

async function createUser(req, res) {
  const { name, email, role } = req.body;

  const existing = await db.getAsync('SELECT id FROM users WHERE email = ?', [email]);
  if (existing) {
    return res.status(409).json({ error: 'email already taken' });
  }

  try {
    const result = await db.runAsync(
      'INSERT INTO users (name, email, role) VALUES (?, ?, ?)',
      [name, email, role]
    );
    res.status(201).json({ id: result.lastID, name, email, role, status: 'active' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getUsers(req, res) {
  try {
    const users = await db.allAsync('SELECT * FROM users');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'could not fetch users' });
  }
}

async function getUserById(req, res) {
  try {
    const user = await db.getAsync('SELECT * FROM users WHERE id = ?', [req.params.id]);
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
    const u = await db.getAsync('SELECT id FROM users WHERE id = ?', [req.params.id]);
    if (!u) return res.status(404).json({ error: 'user not found' });

    // delete their records first to avoid FK issues
    await db.runAsync('DELETE FROM records WHERE userId = ?', [req.params.id]);
    await db.runAsync('DELETE FROM users WHERE id = ?', [req.params.id]);

    res.json({ message: 'deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { createUser, getUsers, getUserById, updateRole, updateStatus, deleteUser };
