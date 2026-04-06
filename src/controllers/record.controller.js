const db = require('../config/db');

async function createRecord(req, res) {
  const { amount, type, category, date, notes } = req.body;

  try {
    const result = await db.runAsync(
      'INSERT INTO records (userId, amount, type, category, date, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, amount, type, category, date, notes]
    );
    res.status(201).json({ id: result.lastID, amount, type, category, date, notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getRecords(req, res) {
  const { type, category, startDate, endDate, search, limit = 10, page = 1 } = req.query;
  const offset = (page - 1) * limit;

  let sql = 'SELECT * FROM records WHERE deletedAt IS NULL';
  const params = [];

  if (req.user.role !== 'admin') {
    sql += ' AND userId = ?';
    params.push(req.user.id);
  }

  if (type) { sql += ' AND type = ?'; params.push(type); }
  if (category) { sql += ' AND category = ?'; params.push(category); }
  if (startDate) { sql += ' AND date >= ?'; params.push(startDate); }
  if (endDate) { sql += ' AND date <= ?'; params.push(endDate); }
  if (search) { sql += ' AND (notes LIKE ? OR category LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

  sql += ' ORDER BY date DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  try {
    const rows = await db.allAsync(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'failed to fetch records' });
  }
}

async function getRecordById(req, res) {
  try {
    let sql = 'SELECT * FROM records WHERE id = ? AND deletedAt IS NULL';
    const params = [req.params.id];

    if (req.user.role !== 'admin') {
      sql += ' AND userId = ?';
      params.push(req.user.id);
    }

    const record = await db.getAsync(sql, params);
    if (!record) return res.status(404).json({ error: 'not found' });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateRecord(req, res) {
  try {
    let sql = 'SELECT * FROM records WHERE id = ? AND deletedAt IS NULL';
    const params = [req.params.id];

    if (req.user.role !== 'admin') {
      sql += ' AND userId = ?';
      params.push(req.user.id);
    }

    const existing = await db.getAsync(sql, params);
    if (!existing) return res.status(404).json({ error: 'record not found' });

    const updated = { ...existing, ...req.body };

    await db.runAsync(
      'UPDATE records SET amount = ?, type = ?, category = ?, date = ?, notes = ? WHERE id = ?',
      [updated.amount, updated.type, updated.category, updated.date, updated.notes, req.params.id]
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'update failed' });
  }
}

async function deleteRecord(req, res) {
  try {
    let sql = 'SELECT id FROM records WHERE id = ? AND deletedAt IS NULL';
    const params = [req.params.id];

    if (req.user.role !== 'admin') {
      sql += ' AND userId = ?';
      params.push(req.user.id);
    }

    const r = await db.getAsync(sql, params);
    if (!r) return res.status(404).json({ error: 'not found' });

    await db.runAsync("UPDATE records SET deletedAt = CURRENT_TIMESTAMP WHERE id = ?", [req.params.id]);
    res.json({ message: 'record deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { createRecord, getRecords, getRecordById, updateRecord, deleteRecord };
