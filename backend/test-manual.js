// Test if there's an issue with the specific EmailService file
require('dotenv').config();

console.log('Testing manual EmailService creation...');

const nodemailer = require('nodemailer');
const pdfGenerator = require('./utils/pdfGenerator');

class TestEmailService {
  constructor() {
    console.log('TestEmailService constructor called');
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransporter({
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

      console.log('✅ Test email service initialized');
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
    }
  }

  async sendOrderConfirmationEmailWithPDF(order, user) {
    console.log('sendOrderConfirmationEmailWithPDF called');
    return { success: true, test: true };
  }

  async sendOrderStatusUpdateEmailWithPDF(order, user, newStatus) {
    console.log('sendOrderStatusUpdateEmailWithPDF called');
    return { success: true, test: true };
  }
}

console.log('Creating test instance...');
const testInstance = new TestEmailService();
console.log('Test instance created:', Object.keys(testInstance));
console.log('Method exists?', typeof testInstance.sendOrderConfirmationEmailWithPDF);

console.log('\nNow loading actual EmailService...');
const actualEmailService = require('./utils/emailService');
console.log('Actual EmailService:', Object.keys(actualEmailService));
console.log('Actual method exists?', typeof actualEmailService.sendOrderConfirmationEmailWithPDF);
