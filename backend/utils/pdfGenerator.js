const htmlPdf = require('html-pdf-node');
const path = require('path');

class PDFGenerator {
  constructor() {
    this.options = {
      format: 'A4',
      width: '210mm',
      height: '297mm',
      border: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    };
  }

  /**
   * Generate PDF receipt for an order
   * @param {Object} order - Order object with populated fields
   * @param {Object} user - User object
   * @returns {Promise<Buffer>} - PDF buffer
   */
  async generateOrderReceiptPDF(order, user) {
    try {
      const html = this.generateReceiptHTML(order, user);
      
      const file = {
        content: html
      };

      const pdfBuffer = await htmlPdf.generatePdf(file, this.options);
      console.log('✅ PDF receipt generated successfully');
      return pdfBuffer;
    } catch (error) {
      console.error('❌ Error generating PDF receipt:', error);
      throw error;
    }
  }

  /**
   * Generate HTML template for order receipt
   * @param {Object} order - Order object
   * @param {Object} user - User object
   * @returns {string} - HTML string
   */
  generateReceiptHTML(order, user) {
    const orderDate = new Date(order.createdAt);
    const formattedDate = orderDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = orderDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Calculate totals
    const subtotal = order.orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const tax = order.taxPrice || (subtotal * 0.02); // 2% tax
    const shipping = order.shippingPrice || 0;
    const total = order.totalPrice;

    // Generate items table rows
    const itemsHTML = order.orderItems.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${item.game?.title || 'Game no longer available'}</strong><br>
          <small style="color: #666;">Platform: ${item.game?.platform || 'N/A'}</small>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          ৳${item.price.toFixed(2)}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          ৳${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `).join('');

    // Mask payment details for security
    let paymentDetails = '';
    if (order.paymentResult && order.paymentMethod) {
      switch (order.paymentMethod) {
        case 'creditCard':
          paymentDetails = `Card ending in ****`;
          break;
        case 'paypal':
          paymentDetails = `PayPal (${order.paymentResult.email_address || 'N/A'})`;
          break;
        case 'bkash':
        case 'nagad':
          paymentDetails = `${order.paymentMethod.toUpperCase()}`;
          break;
        default:
          paymentDetails = order.paymentMethod.toUpperCase();
      }
    }

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Receipt - ${order._id.toString().slice(-8).toUpperCase()}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
            background: #f9f9f9;
          }
          .receipt-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: bold;
          }
          .header p {
            margin: 5px 0 0 0;
            font-size: 1.1em;
            opacity: 0.9;
          }
          .content {
            padding: 30px;
          }
          .receipt-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            flex-wrap: wrap;
          }
          .info-section {
            flex: 1;
            min-width: 250px;
            margin-bottom: 20px;
          }
          .info-section h3 {
            color: #667eea;
            border-bottom: 2px solid #667eea;
            padding-bottom: 5px;
            margin-bottom: 15px;
          }
          .info-item {
            margin-bottom: 8px;
          }
          .info-item strong {
            display: inline-block;
            width: 120px;
            color: #555;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
            background: white;
          }
          .items-table th {
            background: #667eea;
            color: white;
            padding: 15px 10px;
            text-align: left;
            font-weight: bold;
          }
          .items-table th:nth-child(2),
          .items-table th:nth-child(3),
          .items-table th:nth-child(4) {
            text-align: center;
          }
          .items-table th:nth-child(3),
          .items-table th:nth-child(4) {
            text-align: right;
          }
          .total-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
          }
          .total-row:last-child {
            border-bottom: none;
            font-weight: bold;
            font-size: 1.2em;
            color: #667eea;
          }
          .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            color: white;
          }
          .status-pending {
            background: #ffc107;
          }
          .status-processing {
            background: #007bff;
          }
          .status-completed {
            background: #28a745;
          }
          .status-cancelled {
            background: #dc3545;
          }
          .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #eee;
          }
          .footer p {
            margin: 5px 0;
            color: #666;
          }
          .payment-completed {
            background: #28a745;
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            display: inline-block;
            margin: 20px 0;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <h1>🎮 GameBazaar</h1>
            <p>Official Purchase Receipt</p>
          </div>
          
          <div class="content">
            <div class="receipt-info">
              <div class="info-section">
                <h3>Order Information</h3>
                <div class="info-item">
                  <strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}
                </div>
                <div class="info-item">
                  <strong>Date:</strong> ${formattedDate}
                </div>
                <div class="info-item">
                  <strong>Time:</strong> ${formattedTime}
                </div>
                <div class="info-item">
                  <strong>Status:</strong> 
                  <span class="status-badge status-${order.status}">${order.status}</span>
                </div>
              </div>
              
              <div class="info-section">
                <h3>Customer Information</h3>
                <div class="info-item">
                  <strong>Name:</strong> ${user.name}
                </div>
                <div class="info-item">
                  <strong>Email:</strong> ${user.email}
                </div>
                <div class="info-item">
                  <strong>Payment:</strong> ${paymentDetails}
                </div>
                ${order.isPaid ? '<div class="payment-completed">✅ PAYMENT COMPLETED</div>' : ''}
              </div>
            </div>

            <h3>Order Items</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Game</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>

            <div class="total-section">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>৳${subtotal.toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>Tax (2%):</span>
                <span>৳${tax.toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>Shipping:</span>
                <span>৳${shipping.toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>Total:</span>
                <span>৳${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p><strong>Thank you for shopping with GameBazaar!</strong></p>
            <p>For any questions or concerns, please contact support@gamebazaar.com</p>
            <p>© ${new Date().getFullYear()} GameBazaar - All Rights Reserved</p>
            <p style="font-size: 12px; margin-top: 15px;">
              Order ID: #${order._id.toString().slice(-8).toUpperCase()} | Generated: ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new PDFGenerator();
