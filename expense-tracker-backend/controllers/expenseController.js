// controllers/expenseController.js
const db = require('../config/db');

// GET all expenses for the authenticated user (with Category Name JOIN)
exports.getExpenses = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: No user found in token' });
    }

    const [rows] = await db.query(
      `SELECT 
         expenses.*, 
         categories.name AS category_name 
       FROM expenses 
       LEFT JOIN categories ON expenses.category_id = categories.id 
       WHERE expenses.user_id = ? 
       ORDER BY expenses.date DESC`,
      [userId]
    );

    res.status(200).json(rows);
  } catch (err) {
    console.error('getExpenses error:', err);
    res.status(500).json({ message: 'Error fetching expenses', error: err.message });
  }
};

// POST add new expense
exports.addExpense = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const { category_id, amount, description, date } = req.body;

    if (!amount || !date) {
      return res.status(400).json({ message: 'Amount and date are required' });
    }

    const [result] = await db.query(
      'INSERT INTO expenses (user_id, category_id, amount, description, date) VALUES (?, ?, ?, ?, ?)',
      [userId, category_id || null, amount, description || 'Expense', date]
    );

    res.status(201).json({
      id: result.insertId,
      user_id: userId,
      category_id,
      amount,
      description,
      date,
    });
  } catch (err) {
    console.error('addExpense error:', err);
    res.status(500).json({ message: 'Error creating expense', error: err.message });
  }
};

// DELETE expense by ID
exports.deleteExpense = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const { id } = req.params;

    const [result] = await db.query(
      'DELETE FROM expenses WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Expense not found or unauthorized' });
    }

    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (err) {
    console.error('deleteExpense error:', err);
    res.status(500).json({ message: 'Error deleting expense', error: err.message });
  }
};