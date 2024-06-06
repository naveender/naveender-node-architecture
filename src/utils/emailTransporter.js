const nodemailer =   require("nodemailer");
const config = require("../config/config");

module.exports.emailTransporter = nodemailer.createTransport({
    host: config.smtpHost,
    auth: {
        user: config.smtpUsername,
        pass: config.smtpPassword,
    },
});

