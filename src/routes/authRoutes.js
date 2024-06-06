// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');

router.post('/login', authController.login);

module.exports = router;
