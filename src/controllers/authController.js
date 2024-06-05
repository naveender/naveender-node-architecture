// src/controllers/authController.js
const authService = require('../services/authService');

exports.login = async (req, res) => {
    try {
        const token = await authService.login(req.body);
        res.status(200).json({ token });
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
};
