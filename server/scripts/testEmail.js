const dotenv = require('dotenv');
const { sendEmail } = require('../utils/emailService');
const path = require('path');

// Load env from the parent server directory
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testEmail() {
    console.log('--- Email Test Script ---');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('NODE_ENV:', process.env.NODE_ENV);

    try {
        const info = await sendEmail({
            to: process.env.EMAIL_USER || 'test@example.com',
            subject: 'Amdox Email Test',
            text: 'This is a test email from the Amdox server to verify your configuration.',
            html: '<h3>Amdox Email Test</h3><p>This is a test email from the Amdox server to verify your configuration.</p>'
        });

        console.log('✅ Test result:', info.messageId);

        if (info.messageId === 'mock-id-placeholder') {
            console.log('\nℹ️  Note: Email was MOCKED because you are using placeholder credentials.');
            console.log('To send real emails, update .env with a real Gmail address and App Password.');
        } else {
            console.log('\n🚀 Email successfully sent (if credentials were real)!');
        }
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
    }
}

testEmail();
