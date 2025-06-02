// Quick test for email sending
require('dotenv').config();
const emailService = require('./utils/emailService');

async function testEmailSending() {
  console.log('Testing email sending functionality...');
  
  // Simple test email without PDF
  const testResult = await emailService.sendEmail(
    'user5@a.com',
    'Test Email from GameBazaar',
    '<h1>Test Email</h1><p>This is a test email to verify the email service is working.</p>',
    'Test Email - This is a test email to verify the email service is working.'
  );
  
  console.log('Email test result:', testResult);
}

testEmailSending().catch(console.error);
