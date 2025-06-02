const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    console.log('EmailService constructor called');
    this.transporter = null;
  }

  async sendOrderConfirmationEmailWithPDF(order, user) {
    console.log('sendOrderConfirmationEmailWithPDF called');
    return { success: true };
  }
}

const instance = new EmailService();
console.log('Instance created');
console.log('Methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(instance)));

module.exports = instance;
