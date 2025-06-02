// Fresh test after fixing the typo
require('dotenv').config();

console.log('Fresh test of EmailService...');

// Clear require cache first
delete require.cache[require.resolve('./utils/emailService')];

console.log('Loading EmailService...');
const emailService = require('./utils/emailService');

console.log('EmailService type:', typeof emailService);
console.log('EmailService constructor:', emailService.constructor.name);
console.log('EmailService keys:', Object.keys(emailService));

if (emailService.sendOrderConfirmationEmailWithPDF) {
  console.log('✅ sendOrderConfirmationEmailWithPDF exists');
} else {
  console.log('❌ sendOrderConfirmationEmailWithPDF missing');
}

if (emailService.sendOrderStatusUpdateEmailWithPDF) {
  console.log('✅ sendOrderStatusUpdateEmailWithPDF exists');
} else {
  console.log('❌ sendOrderStatusUpdateEmailWithPDF missing');
}
