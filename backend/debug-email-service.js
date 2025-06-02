// Debug script to check EmailService loading
const emailService = require('./utils/emailService');

console.log('EmailService object:', emailService);
console.log('EmailService type:', typeof emailService);
console.log('EmailService constructor:', emailService.constructor);
console.log('EmailService keys:', Object.keys(emailService));
console.log('EmailService methods:', Object.getOwnPropertyNames(emailService));

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
