const nodemailer = require('nodemailer');

/**
 * Send email using nodemailer
 * @param {Object} options - Email options (to, subject, text, html)
 */
const sendEmail = async (options) => {
    // Create a transporter
    // Note: For Gmail, you should use an App Password
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // Define email options
    const mailOptions = {
        from: `"Amdox" <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
    };

    // Send the email
    try {
        // Fallback for development if credentials are placeholders
        if (process.env.NODE_ENV === 'development' &&
            (process.env.EMAIL_USER === 'your-email@gmail.com' || !process.env.EMAIL_USER)) {
            console.log('--- DEVELOPMENT EMAIL MOCK ---');
            console.log('To:', options.to);
            console.log('Subject:', options.subject);
            console.log('Content:', options.text);
            console.log('------------------------------');
            return { messageId: 'mock-id' };
        }

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Email could not be sent');
    }
};

module.exports = { sendEmail };
