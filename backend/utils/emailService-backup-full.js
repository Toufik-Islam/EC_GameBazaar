// Backup of current EmailService before recreation
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
          ${['approved', 'shipped', 'delivered'].includes(newStatus) ? '<p>📄 Updated PDF receipt attached.</p>' : ''}
        </body>
        </html>
      `;
      
      let attachments = [];
      
      if (['approved', 'shipped', 'delivered'].includes(newStatus)) {
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
}

module.exports = new EmailService();
