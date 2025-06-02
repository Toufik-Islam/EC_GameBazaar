const nodemailer = require('nodemailer');
const path = require('path');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
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

  async sendEmail(to, subject, html, text = null) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
        text: text || this.stripHtml(html)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${to}: ${subject}`);
      return {
        success: true,
        messageId: result.messageId,
        response: result.response
      };
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '');
  }

  // Email Templates
  getWelcomeEmailTemplate(user) {
    return {
      subject: '🎮 Welcome to GameBazaar!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to GameBazaar</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .highlight { color: #667eea; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎮 Welcome to GameBazaar!</h1>
              <p>Your ultimate gaming destination</p>
            </div>
            <div class="content">
              <h2>Hello ${user.name}! 👋</h2>
              <p>Thank you for joining GameBazaar! We're excited to have you as part of our gaming community.</p>
              
              <h3>What's Next?</h3>
              <ul>
                <li>🎯 Browse our extensive game collection</li>
                <li>🛒 Add games to your cart and wishlist</li>
                <li>📦 Enjoy fast and secure delivery</li>
                <li>⭐ Rate and review your favorite games</li>
              </ul>

              <p>Your account details:</p>
              <ul>
                <li><strong>Email:</strong> ${user.email}</li>
                <li><strong>Role:</strong> <span class="highlight">${user.role}</span></li>
                <li><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</li>
              </ul>

              <a href="${process.env.FRONTEND_URL}" class="button">Start Shopping Now! 🛍️</a>
              
              <p>If you have any questions, feel free to contact our support team.</p>
            </div>
            <div class="footer">
              <p>© 2025 GameBazaar. All rights reserved.</p>
              <p>You received this email because you registered for a GameBazaar account.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  getOrderConfirmationTemplate(order, user) {
    const items = order.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${item.name}</strong><br>
          <small>Platform: ${item.platform}</small>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          $${item.price.toFixed(2)}
        </td>
      </tr>
    `).join('');

    return {
      subject: `🎮 Order Confirmation #${order._id.toString().slice(-8).toUpperCase()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .order-info { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .order-table th { background: #667eea; color: white; padding: 12px; text-align: left; }
            .order-table td { padding: 10px; border-bottom: 1px solid #eee; }
            .total-row { font-weight: bold; background: #f0f0f0; }
            .status-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
            .status-pending { background: #fff3cd; color: #856404; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎮 Order Confirmed!</h1>
              <p>Thank you for your purchase</p>
            </div>
            <div class="content">
              <h2>Hello ${user.name}! 👋</h2>
              <p>Great news! We've received your order and it's being processed.</p>
              
              <div class="order-info">
                <h3>Order Details</h3>
                <p><strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
                <p><strong>Status:</strong> <span class="status-badge status-pending">${order.status}</span></p>
                <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                <p><strong>Total Amount:</strong> $${order.totalAmount.toFixed(2)}</p>
              </div>

              <h3>Items Ordered</h3>
              <table class="order-table">
                <thead>
                  <tr>
                    <th>Game</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${items}
                  <tr class="total-row">
                    <td colspan="2">Total</td>
                    <td style="text-align: right;">$${order.totalAmount.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              <div class="order-info">
                <h3>What's Next?</h3>
                <ul>
                  <li>📋 Your order is currently pending admin approval</li>
                  <li>✅ You'll receive another email when your order is approved</li>
                  <li>📦 Once approved, your games will be processed for delivery</li>
                  <li>📧 We'll keep you updated throughout the process</li>
                </ul>
              </div>
              
              <p>If you have any questions about your order, feel free to contact our support team.</p>
            </div>
            <div class="footer">
              <p>© 2025 GameBazaar. All rights reserved.</p>
              <p>Order ID: #${order._id.toString().slice(-8).toUpperCase()}</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  getOrderStatusUpdateTemplate(order, user, status) {
    const statusConfig = {
      'approved': {
        title: '✅ Order Approved!',
        message: 'Great news! Your order has been approved and is now being processed.',
        badgeClass: 'status-approved',
        badgeStyle: 'background: #d4edda; color: #155724;'
      },
      'processing': {
        title: '⚡ Order Processing',
        message: 'Your order is currently being processed and will be shipped soon.',
        badgeClass: 'status-processing',
        badgeStyle: 'background: #cce5f0; color: #0c5460;'
      },
      'shipped': {
        title: '🚚 Order Shipped!',
        message: 'Your order has been shipped and is on its way to you!',
        badgeClass: 'status-shipped',
        badgeStyle: 'background: #e2e3e5; color: #41464b;'
      },
      'delivered': {
        title: '📦 Order Delivered!',
        message: 'Your order has been successfully delivered. Enjoy your games!',
        badgeClass: 'status-delivered',
        badgeStyle: 'background: #d1ecf1; color: #0c5460;'
      },
      'cancelled': {
        title: '❌ Order Cancelled',
        message: 'We regret to inform you that your order has been cancelled.',
        badgeClass: 'status-cancelled',
        badgeStyle: 'background: #f8d7da; color: #721c24;'
      }
    };

    const config = statusConfig[status] || statusConfig['processing'];

    return {
      subject: `🎮 Order Update: ${config.title.replace(/[^\w\s]/gi, '')} - #${order._id.toString().slice(-8).toUpperCase()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Status Update</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .order-info { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; text-transform: uppercase; ${config.badgeStyle} }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .highlight { color: #667eea; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${config.title}</h1>
              <p>Order #${order._id.toString().slice(-8).toUpperCase()}</p>
            </div>
            <div class="content">
              <h2>Hello ${user.name}! 👋</h2>
              <p>${config.message}</p>
              
              <div class="order-info">
                <h3>Order Information</h3>
                <p><strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
                <p><strong>New Status:</strong> <span class="status-badge">${status}</span></p>
                <p><strong>Updated:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
                <p><strong>Total Amount:</strong> $${order.totalAmount.toFixed(2)}</p>
              </div>

              ${status === 'approved' ? `
                <div class="order-info">
                  <h3>What's Next?</h3>
                  <ul>
                    <li>🔄 Your order will be processed within 24 hours</li>
                    <li>📦 You'll receive shipping information once dispatched</li>
                    <li>🚚 Estimated delivery: 3-5 business days</li>
                  </ul>
                </div>
              ` : ''}

              ${status === 'shipped' ? `
                <div class="order-info">
                  <h3>Tracking Information</h3>
                  <p>Your package is on its way! You can track your shipment using the tracking number provided by our delivery partner.</p>
                  <p><strong>Estimated Delivery:</strong> 1-3 business days</p>
                </div>
              ` : ''}

              ${status === 'cancelled' ? `
                <div class="order-info">
                  <h3>Next Steps</h3>
                  <ul>
                    <li>💰 Any payment made will be refunded within 5-7 business days</li>
                    <li>📧 You'll receive a refund confirmation email</li>
                    <li>🛍️ Feel free to place a new order anytime</li>
                  </ul>
                </div>
              ` : ''}
              
              <p>If you have any questions, please don't hesitate to contact our support team.</p>
            </div>
            <div class="footer">
              <p>© 2025 GameBazaar. All rights reserved.</p>
              <p>Order ID: #${order._id.toString().slice(-8).toUpperCase()}</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  // Main methods for sending different types of emails
  async sendWelcomeEmail(user) {
    const template = this.getWelcomeEmailTemplate(user);
    return await this.sendEmail(user.email, template.subject, template.html);
  }

  async sendOrderConfirmationEmail(order, user) {
    const template = this.getOrderConfirmationTemplate(order, user);
    return await this.sendEmail(user.email, template.subject, template.html);
  }

  async sendOrderStatusUpdateEmail(order, user, status) {
    const template = this.getOrderStatusUpdateTemplate(order, user, status);
    return await this.sendEmail(user.email, template.subject, template.html);
  }
}

module.exports = new EmailService();
