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
   * Generate HTML template for order receipt - Simplified to match frontend style
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

    // Format Order ID to match frontend (first 10 characters + ...)
    const displayOrderId = `${order._id.toString()}`;

    // Calculate totals
    const subtotal = order.orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const tax = order.taxPrice || 0;
    const shipping = order.shippingPrice || 0;
    const total = order.totalPrice;

    // Format payment method like frontend
    const formatPaymentMethod = (method, result) => {
      switch (method) {
        case 'creditCard':
          return `CARD`;
        case 'paypal':
          return `PAYPAL`;
        case 'bkash':
          return `BKASH`;
        case 'nagad':
          return `NAGAD`;
        default:
          return method?.toUpperCase() || 'N/A';
      }
    };

    const paymentDetails = formatPaymentMethod(order.paymentMethod, order.paymentResult);

    // Generate items table rows with simple styling to match frontend
    const itemsHTML = order.orderItems.map((item, index) => {
      const isAvailable = item.game !== null;
      const gameTitle = isAvailable ? item.game.title : 'Game no longer available';
      const platform = isAvailable ? item.game.platform : 'N/A';
      const itemTotal = item.price * item.quantity;
      
      return `
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 8px; text-align: left;">${gameTitle}</td>
          <td style="padding: 8px; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; text-align: center;">৳${item.price.toFixed(2)}</td>
          <td style="padding: 8px; text-align: center;">৳${itemTotal.toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>GameBazaar Receipt - ${displayOrderId}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 20px;
            background: #fff;
          }
          .receipt-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border: 1px solid #ddd;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #ddd;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            color: #0066cc;
            font-weight: bold;
          }
          .header h2 {
            margin: 5px 0 0 0;
            font-size: 16px;
            color: #333;
            font-weight: normal;
          }
          .section {
            margin-bottom: 20px;
          }
          .section-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #333;
          }
          .info-row {
            margin-bottom: 5px;
            font-size: 12px;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 11px;
          }
          .items-table th {
            background: #2980b9;
            color: white;
            padding: 10px 8px;
            text-align: center;
            font-weight: bold;
          }
          .items-table td {
            padding: 8px;
            border-bottom: 1px solid #ddd;
          }
          .summary-section {
            border-top: 1px solid #ccc;
            padding-top: 10px;
            margin-top: 15px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-size: 12px;
          }
          .total-row {
            font-weight: bold;
            font-size: 14px;
            border-top: 1px solid #333;
            padding-top: 5px;
            margin-top: 5px;
          }
          .payment-completed {
            background: #00aa00;
            color: white;
            padding: 8px 16px;
            border-radius: 15px;
            display: inline-block;
            margin: 10px 0;
            font-weight: bold;
            font-size: 12px;
          }
          .footer {
            text-align: center;
            border-top: 1px solid #666;
            padding-top: 15px;
            margin-top: 20px;
            font-size: 10px;
            color: #666;
          }
          .footer p {
            margin: 3px 0;
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <h1>🎮 Game Bazaar</h1>
            <h2>Official Receipt</h2>
          </div>
          
          <div class="section">
            <div class="info-row"><strong>Date:</strong> ${formattedDate} ${formattedTime}</div>
            <div class="info-row"><strong>Order ID:</strong> ${displayOrderId}</div>
          </div>

          <div class="section">
            <div class="section-title">Customer Information</div>
            <div class="info-row"><strong>Name:</strong> ${user.name || user.username || 'Guest User'}</div>
            <div class="info-row"><strong>Email:</strong> ${user.email || 'customer@gamebazaar.com'}</div>
          </div>

          <div class="section">
            <div class="section-title">Payment Details</div>
            <div class="info-row"><strong>Payment Method:</strong> ${paymentDetails}</div>
            <div class="info-row"><strong>Payment Date:</strong> ${formattedDate}</div>
            ${order.isPaid ? '<div class="payment-completed">PAYMENT COMPLETED</div>' : ''}
          </div>

          <div class="section">
            <div class="section-title">Order Summary</div>
            
            <table class="items-table">
              <thead>
                <tr>
                  <th style="text-align: left;">Item</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>
          </div>

          <div class="summary-section">
            <div class="section-title">Price Summary:</div>
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>৳${subtotal.toFixed(2)}</span>
            </div>
            ${tax > 0 ? `
            <div class="summary-row">
              <span>Tax:</span>
              <span>৳${tax.toFixed(2)}</span>
            </div>
            ` : ''}
            ${shipping > 0 ? `
            <div class="summary-row">
              <span>Shipping:</span>
              <span>৳${shipping.toFixed(2)}</span>
            </div>
            ` : ''}
            <div class="summary-row total-row">
              <span>Total:</span>
              <span>৳${total.toFixed(2)}</span>
            </div>
          </div>

          ${order.approvedBy ? `
            <div class="section">
              <div class="section-title">Approval Information</div>
              <div class="info-row"><strong>Approved by:</strong> ${order.approvedBy.name}</div>
              <div class="info-row"><strong>Email:</strong> ${order.approvedBy.email}</div>
              ${order.approvedAt ? `<div class="info-row"><strong>Approved on:</strong> ${new Date(order.approvedAt).toLocaleDateString()}</div>` : ''}
            </div>
          ` : ''}

          <div class="section">
            <div class="info-row"><strong>Items Purchased:</strong> ${order.orderItems.length}</div>
          </div>

          <div class="footer">
            <p><strong>Thank you for shopping with Game Bazaar!</strong></p>
            <p>For any questions or concerns, please contact support@gamebazaar.com</p>
            <p>© ${new Date().getFullYear()} Game Bazaar - All Rights Reserved</p>
            <p style="margin-top: 10px;">Order ID: ${displayOrderId} | Generated: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new PDFGenerator();
