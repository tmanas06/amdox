const nodemailer = require('nodemailer');

/**
 * Send email using nodemailer
 * @param {Object} options - Email options (to, subject, text, html)
 */
const sendEmail = async (options) => {
    // Check if configuration is missing
    const isPlaceholder = !process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-email@gmail.com' ||
        !process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'your-app-password';

    if (isPlaceholder) {
        console.warn('--- EMAIL CONFIGURATION MISSING OR USING PLACEHOLDERS ---');
        console.warn('To fix this, set real EMAIL_USER and EMAIL_PASS in your .env file.');

        if (process.env.NODE_ENV === 'development') {
            console.log('--- DEVELOPMENT OTP LOG ---');
            console.log('To:', options.to);
            console.log('Subject:', options.subject);
            console.log('Content:', options.text);
            console.log('---------------------------');
            // We still return a mock success for development flow to continue
            return { messageId: 'mock-id-placeholder' };
        }
    }

    // Create a transporter
    // For Gmail, use "App Password". For others, provide host/port.
    const transporterConfigs = {
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    };

    // If custom SMTP is provided
    if (process.env.EMAIL_HOST) {
        delete transporterConfigs.service;
        transporterConfigs.host = process.env.EMAIL_HOST;
        transporterConfigs.port = process.env.EMAIL_PORT || 587;
        transporterConfigs.secure = process.env.EMAIL_SECURE === 'true';
    }

    const transporter = nodemailer.createTransport(transporterConfigs);

    // Define email options
    const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Amdox'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
    };

    // Send the email
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        // Better error message for common issues
        if (error.code === 'EAUTH') {
            throw new Error('Email authentication failed. Check your EMAIL_USER and EMAIL_PASS (App Password).');
        }
        throw new Error('Email could not be sent: ' + error.message);
    }
};

module.exports = { sendEmail };
