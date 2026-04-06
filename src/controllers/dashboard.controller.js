const db = require('../config/db');

async function getSummary(req, res) {
  try {
    const income = await db.getAsync(
      "SELECT COALESCE(SUM(amount), 0) as total FROM records WHERE type = 'income'"
    );
    const expense = await db.getAsync(
      "SELECT COALESCE(SUM(amount), 0) as total FROM records WHERE type = 'expense'"
    );

    res.json({
      totalIncome: income.total,
      totalExpenses: expense.total,
      netBalance: income.total - expense.total,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getCategoryTotals(req, res) {
  try {
    const rows = await db.allAsync(
      'SELECT type, category, SUM(amount) as total FROM records GROUP BY type, category ORDER BY total DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to get category totals' });
  }
}

async function getRecentActivity(req, res) {
  try {
    const rows = await db.allAsync(
      'SELECT * FROM records ORDER BY date DESC, createdAt DESC LIMIT 10'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

//sqlite week numbers start at 0 not 1
async function getMonthlyTrends(req, res) {
  try {
    const rows = await db.allAsync(`
      SELECT 
        strftime('%Y-%m', date) as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM records
      GROUP BY month
      ORDER BY month DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

//  add startdate /endDate filter here !
async function getWeeklyTrends(req, res) {
  try {
    const rows = await db.allAsync(`
      SELECT 
        strftime('%Y-W%W', date) as week,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM records
      GROUP BY week
      ORDER BY week DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('weekly trends broke:', err);
    res.status(500).json({ error: 'could not get weekly trends' });
  }
}

module.exports = { getSummary, getCategoryTotals, getRecentActivity, getMonthlyTrends, getWeeklyTrends };
