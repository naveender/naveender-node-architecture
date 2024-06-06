// src/config/config.js
require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGO_URI,
    applicationName: process.env.APPLICATION_NAME,
    jwtSecret: process.env.JWT_SECRET,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpUsername: process.env.SMTP_USERNAME,
    smtpPassword: process.env.SMTP_PASSWORD,
    smtpMailFrom: process.env.SMTP_MAIL_FROM, 
    adminEmail: process.env.ADMIN_EMAIL,
    emailVerificationSecretKey: process.env.EMAIL_VERIFICATION_SECRET_KEY,
    clientAppUrl: process.env.CLIENT_APP_URL,
    
};
