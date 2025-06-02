const nodemailer = require('nodemailer');
const path = require('path');
const pdfGenerator = require('./pdfGenerator');

class EmailService {
  constructor() {
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

      // Verify connection configuration
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('Email service configuration error:', error);
        } else {
          console.log('✅ Email service is ready to send messages');
        }
      });
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

  // Order confirmation email template
  generateOrderConfirmationEmailHTML(order, user) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-summary { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .item { border-bottom: 1px solid #eee; padding: 15px 0; }
          .item:last-child { border-bottom: none; }
          .total { font-weight: bold; font-size: 18px; color: #667eea; }
          .footer { text-align: center; margin-top: 30px; color: #666; }
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
            <p>Thank you for your order! We're excited to get your games ready for you.</p>
            
            <div class="pdf-note">
              📄 <strong>PDF Receipt Attached:</strong> We've included a detailed PDF receipt with this email for your records.
            </div>
            
            <div class="order-summary">
              <h3>Order Details</h3>
              <p><strong>Order ID:</strong> ${order._id}</p>
              <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Status:</strong> ${order.status}</p>
              
              <h4>Items Ordered:</h4>
              ${order.orderItems.map(item => `
                <div class="item">
                  <strong>${item.game ? item.game.title : 'Game no longer available'}</strong><br>
                  Platform: ${item.game ? item.game.platform : 'N/A'}<br>
                  Quantity: ${item.quantity}<br>
                  Price: ৳${item.price}
                </div>
              `).join('')}
              
              <div style="margin-top: 20px; text-align: right;">
                <p>Subtotal: ৳${(order.totalPrice - order.taxPrice - order.shippingPrice).toFixed(2)}</p>
                <p>Tax: ৳${order.taxPrice}</p>
                <p>Shipping: ৳${order.shippingPrice}</p>
                <p class="total">Total: ৳${order.totalPrice}</p>
              </div>
            </div>
            
            <p>We'll send you another email when your order ships.</p>
            
            <div class="footer">
              <p>Thank you for choosing GameBazaar!</p>
              <p>If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Order status update email template
  generateOrderStatusUpdateEmailHTML(order, user, newStatus) {
    const statusMessages = {
      pending: 'Your order is being processed',
      approved: 'Your order has been approved and will be shipped soon',
      shipped: 'Your order has been shipped',
      delivered: 'Your order has been delivered',
      cancelled: 'Your order has been cancelled'
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .status-update { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .status { font-size: 24px; font-weight: bold; color: #667eea; text-transform: uppercase; }
          .footer { text-align: center; margin-top: 30px; color: #666; }
          .pdf-note { background: #e7f3ff; border: 1px solid #b3d9ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎮 GameBazaar</h1>
            <h2>Order Status Update</h2>
          </div>
          <div class="content">
            <p>Dear ${user.name},</p>
            
            <div class="status-update">
              <div class="status">${newStatus}</div>
              <p>${statusMessages[newStatus] || 'Your order status has been updated'}</p>
            </div>
            
            ${(newStatus === 'approved' || newStatus === 'completed' || newStatus === 'shipped' || newStatus === 'delivered') ? `
              <div class="pdf-note">
                📄 <strong>Updated PDF Receipt Attached:</strong> We've included an updated PDF receipt with this email for your records.
              </div>
            ` : ''}
            
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Total Amount:</strong> ৳${order.totalPrice}</p>
            
            ${newStatus === 'shipped' ? '<p>You should receive your games within 3-5 business days.</p>' : ''}
            ${newStatus === 'delivered' ? '<p>We hope you enjoy your new games! Please let us know if you have any issues.</p>' : ''}
            
            <div class="footer">
              <p>Thank you for choosing GameBazaar!</p>
              <p>If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send order confirmation email with PDF attachment
  async sendOrderConfirmationEmailWithPDF(order, user) {
    try {
      console.log(`📧 Sending order confirmation email with PDF to ${user.email}...`);
      
      // Generate PDF
      const pdfBuffer = await pdfGenerator.generateOrderReceiptPDF(order, user);
      console.log('📄 Generated PDF receipt for order', order._id);
      
      // Prepare email with PDF attachment
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
      
      // Fallback: send email without PDF
      try {
        console.log('📧 Sending fallback order confirmation email without PDF...');
        const subject = `Order Confirmation - ${order._id}`;
        const html = this.generateOrderConfirmationEmailHTML(order, user);
        return await this.sendEmail(user.email, subject, html);
      } catch (fallbackError) {
        console.error('❌ Fallback email also failed:', fallbackError);
        return { success: false, error: fallbackError.message };
      }
    }
  }

  // Send order status update email with PDF attachment (for approved/shipped/delivered orders)
  async sendOrderStatusUpdateEmailWithPDF(order, user, newStatus) {
    try {
      console.log(`📧 Sending order status update email with PDF to ${user.email}...`);
      
      const subject = `Order Status Update - ${order._id} (${newStatus.toUpperCase()})`;
      const html = this.generateOrderStatusUpdateEmailHTML(order, user, newStatus);
      
      let attachments = [];
      
      // Only attach PDF for certain status updates
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

  // Regular order confirmation email (without PDF)
  async sendOrderConfirmationEmail(order, user) {
    try {
      const subject = `Order Confirmation - ${order._id}`;
      const html = this.generateOrderConfirmationEmailHTML(order, user);
      return await this.sendEmail(user.email, subject, html);
    } catch (error) {
      console.error('❌ Failed to send order confirmation email:', error);
      return { success: false, error: error.message };
    }
  }

  // Regular order status update email (without PDF)
  async sendOrderStatusUpdateEmail(order, user, newStatus) {
    try {
      const subject = `Order Status Update - ${order._id} (${newStatus.toUpperCase()})`;
      const html = this.generateOrderStatusUpdateEmailHTML(order, user, newStatus);
      return await this.sendEmail(user.email, subject, html);
    } catch (error) {
      console.error('❌ Failed to send order status update email:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
