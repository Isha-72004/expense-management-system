// routes/authRoutes.js
const express = require('express');
const { register, login } = require('../controllers/authController');
const router = express.Router();

// Define your endpoints using the imported controller methods
router.post('/register', register);
router.post('/login', login);

module.exports = router;