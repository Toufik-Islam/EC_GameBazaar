// Enhanced EmailService with better error handling
const nodemailer = require('nodemailer');
const pdfGenerator = require('./pdfGenerator');

// Ensure environment variables are loaded
require('dotenv').config();

class EmailService {
  constructor() {
    console.log('EmailService constructor called');
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      console.log('Initializing email transporter...');
      console.log('Email user:', process.env.EMAIL_USERNAME);
      console.log('Email pass:', process.env.EMAIL_PASSWORD ? '***SET***' : 'NOT SET');
      
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

  async sendEmail(to, subject, html, text = null, attachments = []) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
        text: text || this.stripHtml(html),
        attachments
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Failed to send email to', to + ':', error);
      return { success: false, error: error.message };
    }
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '');
  }

  generateOrderConfirmationEmailHTML(order, user) {
    return `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .pdf-note { background: #e7f3ff; border: 1px solid #b3d9ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎮 GameBazaar</h1>
            <h2>Order Confirmation</h2>
          </div>
          <div class="content">
            <p>Dear ${user.name},</p>
            <p>Thank you for your order!</p>
            
            <div class="pdf-note">
              📄 <strong>PDF Receipt Attached:</strong> We've included a detailed PDF receipt with this email for your records.
            </div>
            
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Total:</strong> ৳${order.totalPrice}</p>
            <p><strong>Status:</strong> ${order.status}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendOrderConfirmationEmailWithPDF(order, user) {
    try {
      console.log(`📧 Sending order confirmation email with PDF to ${user.email}...`);
      
      const pdfBuffer = await pdfGenerator.generateOrderReceiptPDF(order, user);
      console.log('📄 Generated PDF receipt for order', order._id);
      
      const subject = `Order Confirmation - ${order._id}`;
      const html = this.generateOrderConfirmationEmailHTML(order, user);
      
      const attachments = [{
        filename: `GameBazaar-Receipt-${order._id}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }];
      
      return await this.sendEmail(user.email, subject, html, null, attachments);
      
    } catch (error) {
      console.error('❌ Failed to send order confirmation email with PDF:', error);
      return { success: false, error: error.message };
    }
  }

  async sendOrderStatusUpdateEmailWithPDF(order, user, newStatus) {
    try {
      console.log(`📧 Sending order status update email with PDF to ${user.email}...`);
      
      const subject = `Order Status Update - ${order._id} (${newStatus.toUpperCase()})`;
      const html = `
        <html>
        <body>
          <h1>🎮 GameBazaar - Order Status Update</h1>
          <p>Dear ${user.name},</p>
          <p>Your order <strong>${order._id}</strong> status has been updated to: <strong>${newStatus.toUpperCase()}</strong></p>
          <p>Total: ৳${order.totalPrice}</p>
          ${['approved', 'completed', 'shipped', 'delivered'].includes(newStatus) ? '<p>📄 Updated PDF receipt attached.</p>' : ''}
        </body>
        </html>
      `;
      
      let attachments = [];
      
      if (['approved', 'completed', 'shipped', 'delivered'].includes(newStatus)) {
        try {
          const pdfBuffer = await pdfGenerator.generateOrderReceiptPDF(order, user);
          console.log(`📄 Generated PDF receipt for order status update ${order._id} (${newStatus})`);
          
          attachments = [{
            filename: `GameBazaar-Receipt-${order._id}-${newStatus}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }];
        } catch (pdfError) {
          console.error('❌ PDF generation failed for status update, sending email without PDF:', pdfError);
        }
      }
      
      return await this.sendEmail(user.email, subject, html, null, attachments);
      
    } catch (error) {
      console.error('❌ Failed to send order status update email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendSupportTicketEmail(ticketData) {
    try {
      const { name, email, orderNumber, category, subject, description } = ticketData;
      
      console.log(`📧 Sending support ticket email to support@gamebazaar.com...`);
      
      const supportSubject = `Support Ticket: ${subject} (${category})`;
      const supportHtml = this.generateSupportTicketEmailHTML(ticketData);
      
      // Send email to support team
      const result = await this.sendEmail('touhid12321@gmail.com', supportSubject, supportHtml);
      
      if (result.success) {
        // Send confirmation email to customer
        const confirmationSubject = 'Support Ticket Received - GameBazaar';
        const confirmationHtml = this.generateSupportConfirmationEmailHTML(ticketData);
        
        await this.sendEmail(email, confirmationSubject, confirmationHtml);
        console.log('✅ Support ticket and confirmation emails sent successfully');
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ Failed to send support ticket email:', error);
      return { success: false, error: error.message };
    }
  }

  generateSupportTicketEmailHTML(ticketData) {
    const { name, email, orderNumber, category, subject, description } = ticketData;
    
    return `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #555; }
          .value { background: white; padding: 10px; border-radius: 5px; border-left: 4px solid #667eea; }
          .description { background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea; white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎮 GameBazaar</h1>
            <h2>New Support Ticket</h2>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Customer Name:</div>
              <div class="value">${name}</div>
            </div>
            
            <div class="field">
              <div class="label">Email Address:</div>
              <div class="value">${email}</div>
            </div>
            
            ${orderNumber ? `
            <div class="field">
              <div class="label">Order Number:</div>
              <div class="value">${orderNumber}</div>
            </div>
            ` : ''}
            
            <div class="field">
              <div class="label">Category:</div>
              <div class="value">${this.getCategoryLabel(category)}</div>
            </div>
            
            <div class="field">
              <div class="label">Subject:</div>
              <div class="value">${subject}</div>
            </div>
            
            <div class="field">
              <div class="label">Description:</div>
              <div class="description">${description}</div>
            </div>
            
            <p><small>This ticket was submitted on ${new Date().toLocaleString()}</small></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateSupportConfirmationEmailHTML(ticketData) {
    const { name, subject, category } = ticketData;
    
    return `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .ticket-info { background: #e7f3ff; border: 1px solid #b3d9ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎮 GameBazaar</h1>
            <h2>Support Ticket Received</h2>
          </div>
          <div class="content">
            <p>Dear ${name},</p>
            
            <p>Thank you for contacting GameBazaar support. We have received your support ticket and our team will review it shortly.</p>
            
            <div class="ticket-info">
              <h3>Ticket Details:</h3>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Category:</strong> ${this.getCategoryLabel(category)}</p>
              <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <p><strong>What happens next?</strong></p>
            <ul>
              <li>Our support team will review your ticket within 24 hours</li>
              <li>You will receive a response via email at the address you provided</li>
              <li>For urgent matters, you can also contact us at +1-800-GAME-123</li>
            </ul>
            
            <p>Thank you for choosing GameBazaar!</p>
            
            <p>Best regards,<br>
            The GameBazaar Support Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getCategoryLabel(category) {
    const categories = {
      'order': 'Order Issues',
      'payment': 'Payment Problems',
      'account': 'Account Management',
      'technical': 'Technical Support',
      'product': 'Product Information',
      'return': 'Returns & Refunds',
      'other': 'Other'
    };
    return categories[category] || category;
  }

  async sendContactFormEmail(contactData) {
    try {
      const { firstName, lastName, email, subject, message } = contactData;
      
      console.log(`📧 Sending contact form email to touhid12321@gmail.com...`);
      
      const contactSubject = `Contact Form: ${subject}`;
      const contactHtml = this.generateContactFormEmailHTML(contactData);
      
      // Send email to designated contact email
      const result = await this.sendEmail('touhid12321@gmail.com', contactSubject, contactHtml);
      
      if (result.success) {
        // Send confirmation email to customer
        const confirmationSubject = 'Thank you for contacting GameBazaar';
        const confirmationHtml = this.generateContactConfirmationEmailHTML(contactData);
        
        await this.sendEmail(email, confirmationSubject, confirmationHtml);
        console.log('✅ Contact form and confirmation emails sent successfully');
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ Failed to send contact form email:', error);
      return { success: false, error: error.message };
    }
  }

  generateContactFormEmailHTML(contactData) {
    const { firstName, lastName, email, subject, message } = contactData;
    
    return `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #555; }
          .value { background: white; padding: 10px; border-radius: 5px; border-left: 4px solid #667eea; }
          .message { background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea; white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎮 GameBazaar</h1>
            <h2>New Contact Form Message</h2>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">From:</div>
              <div class="value">${firstName} ${lastName}</div>
            </div>
            
            <div class="field">
              <div class="label">Email Address:</div>
              <div class="value">${email}</div>
            </div>
            
            <div class="field">
              <div class="label">Subject:</div>
              <div class="value">${subject}</div>
            </div>
            
            <div class="field">
              <div class="label">Message:</div>
              <div class="message">${message}</div>
            </div>
            
            <p><small>This message was sent on ${new Date().toLocaleString()}</small></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateContactConfirmationEmailHTML(contactData) {
    const { firstName, lastName, subject } = contactData;
    
    return `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .message-info { background: #e7f3ff; border: 1px solid #b3d9ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎮 GameBazaar</h1>
            <h2>Thank You for Contacting Us!</h2>
          </div>
          <div class="content">
            <p>Dear ${firstName} ${lastName},</p>
            
            <p>Thank you for reaching out to GameBazaar! We have received your message and our team will review it promptly.</p>
            
            <div class="message-info">
              <h3>Your Message Details:</h3>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <p><strong>What happens next?</strong></p>
            <ul>
              <li>Our team will review your message within 24 hours</li>
              <li>You will receive a response via email at the address you provided</li>
              <li>For urgent inquiries, you can also call us at +880 1234-567890</li>
            </ul>
            
            <p>We appreciate your interest in GameBazaar and look forward to assisting you!</p>
            
            <p>Best regards,<br>
            The GameBazaar Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();
