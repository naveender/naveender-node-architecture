// src/routes/CustomerRoutes.js
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/CustomerController');
const authMiddleware = require('../middlewares/authMiddleware');

// Apply authentication middleware to all customer routes
router.use(authMiddleware);

// Create a new customer
router.post('/', customerController.createCustomer);

// Get all customers
router.get('/', customerController.getAllCustomers);

// Get a specific customer by ID
router.get('/:id', customerController.getCustomerById);

// Update a customer by ID
router.put('/:id', customerController.updateCustomer);

// Delete a customer by ID
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;
