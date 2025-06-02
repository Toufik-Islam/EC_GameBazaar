// Simple test for EmailService constructor
console.log('Loading dotenv...');
require('dotenv').config();

console.log('Email env vars check:');
console.log('EMAIL_USERNAME:', process.env.EMAIL_USERNAME);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***set***' : 'NOT SET');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

console.log('\nAttempting to load EmailService...');
const emailService = require('./utils/emailService');
console.log('EmailService loaded successfully');
console.log('Type:', typeof emailService);
console.log('Constructor:', emailService.constructor.name);
console.log('Keys:', Object.keys(emailService));
console.log('Prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(emailService)));
