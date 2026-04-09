require('dotenv').config();
const { sendWelcomeEmail } = require('./services/emailService');

const testEmail = async () => {
  const targetEmail = process.argv[2] || process.env.EMAIL_USER;
  console.log('--- Email Connection Test ---');
  console.log('Sender (EMAIL_USER):', process.env.EMAIL_USER);
  console.log('Recipient (Target):', targetEmail);
  
  const dummyUser = {
    name: 'Test Admin',
    email: targetEmail,
    role: 'Candidate',
    trustScore: 100
  };

  try {
    console.log('Attempting to send test welcome email...');
    await sendWelcomeEmail(dummyUser);
    console.log('✅ Test email command completed. Please check your inbox at:', process.env.EMAIL_USER);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to send email:', err.message);
    process.exit(1);
  }
};

testEmail();
