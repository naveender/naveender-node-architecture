// src/controllers/customerController.js
const customerService = require('../services/customerService');

exports.createCustomer = async (req, res) => {
    try {
        const customer = await customerService.createCustomer(req.body);
        res.status(201).json(customer);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getAllCustomers = async (req, res) => {
    try {
        const customers = await customerService.getAllCustomers();
        res.status(200).json(customers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getCustomerById = async (req, res) => {
    try {
        const customer = await customerService.getCustomerById(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.status(200).json(customer);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateCustomer = async (req, res) => {
    try {
        const customer = await customerService.updateCustomer(req.params.id, req.body);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.status(200).json(customer);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteCustomer = async (req, res) => {
    try {
        const customer = await customerService.deleteCustomer(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
