// src/app.js
const express = require('express');
const mongoose = require('mongoose');
const config = require('./config/config');
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const cronJobs = require('./jobs/cronJobs');

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);

mongoose.connect(config.mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

cronJobs.start();

module.exports = app;
