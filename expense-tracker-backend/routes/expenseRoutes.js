// routes/expenseRoutes.js
const express = require('express');
const router = express.Router();

// 1. Import controller methods
const expenseController = require('../controllers/expenseController');

// 2. Import auth middleware (check if your middleware exports `protect`, `authMiddleware`, or module.exports directly)
const authMiddleware = require('../middleware/authMiddleware');
const auth = typeof authMiddleware === 'function' ? authMiddleware : authMiddleware.protect || authMiddleware.auth;

// Routes
router.get('/', auth, expenseController.getExpenses);
router.post('/', auth, expenseController.addExpense);
router.delete('/:id', auth, expenseController.deleteExpense);

module.exports = router;