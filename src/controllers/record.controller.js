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

//   filter by type, category, startDate, endDate
async function getRecords(req, res) {
  const { type, category, startDate, endDate } = req.query;

  let sql = 'SELECT * FROM records WHERE 1=1';
  const params = [];

  if (type) { sql += ' AND type = ?'; params.push(type); }
  if (category) { sql += ' AND category = ?'; params.push(category); }
  if (startDate) { sql += ' AND date >= ?'; params.push(startDate); }
  if (endDate) { sql += ' AND date <= ?'; params.push(endDate); }

  sql += ' ORDER BY date DESC';

  try {
    const rows = await db.allAsync(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('getRecords failed:', err);
    res.status(500).json({ error: 'failed to fetch records' });
  }
}

async function getRecordById(req, res) {
    try {
    const record = await db.getAsync('SELECT * FROM records WHERE id = ?', [req.params.id]);
    if (!record) return res.status(404).json({ error: 'not found' });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateRecord(req, res) {
  try {
    const existing = await db.getAsync('SELECT * FROM records WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'record not found' });

    const updated = { ...existing, ...req.body };

    await db.runAsync(
      'UPDATE records SET amount = ?, type = ?, category = ?, date = ?, notes = ? WHERE id = ?',
      [updated.amount, updated.type, updated.category, updated.date, updated.notes, req.params.id]
    );

    res.json(updated);
  } catch (err) {
    console.error('updateRecord error', err);
    res.status(500).json({ error: 'update failed' });
  }
}

async function deleteRecord(req, res) {
  try {
    const r = await db.getAsync('SELECT id FROM records WHERE id = ?', [req.params.id]);
    if (!r) return res.status(404).json({ error: 'not found' });

    await db.runAsync('DELETE FROM records WHERE id = ?', [req.params.id]);
    res.json({ message: 'record deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { createRecord, getRecords, getRecordById, updateRecord, deleteRecord };
