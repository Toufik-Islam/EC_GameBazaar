// Test direct execution of EmailService
console.log('Testing EmailService direct execution...');

try {
  const EmailService = require('./utils/emailService');
  console.log('EmailService loaded:', typeof EmailService);
  console.log('EmailService keys:', Object.keys(EmailService));
  
  if (EmailService && EmailService.constructor && EmailService.constructor.name) {
    console.log('Constructor name:', EmailService.constructor.name);
  }
} catch (error) {
  console.error('Error loading EmailService:', error);
}
