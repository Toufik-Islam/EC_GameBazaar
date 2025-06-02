// Test running EmailService directly to catch any errors
require('dotenv').config();

console.log('Testing direct execution...');

try {
  console.log('1. Loading nodemailer...');
  const nodemailer = require('nodemailer');
  console.log('✅ nodemailer loaded');
  
  console.log('2. Testing createTransport...');
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });
  console.log('✅ createTransport works');
  
  console.log('3. Loading pdfGenerator...');
  const pdfGenerator = require('./utils/pdfGenerator');
  console.log('✅ pdfGenerator loaded');
  
  console.log('4. Now testing EmailService class manually...');
  
  const EmailServiceCode = `
const nodemailer = require('nodemailer');
const pdfGenerator = require('./pdfGenerator');

class EmailService {
  constructor() {
    console.log('EmailService constructor called');
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      console.log('✅ Email service initialized');
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
    }
  }

  async sendOrderConfirmationEmailWithPDF(order, user) {
    return { success: true, test: true };
  }

  async sendOrderStatusUpdateEmailWithPDF(order, user, newStatus) {
    return { success: true, test: true };
  }
}

module.exports = new EmailService();
`;

  console.log('5. Creating EmailService directly...');
  eval(EmailServiceCode);
  
} catch (error) {
  console.error('Error in direct test:', error);
}
