const mongoose = require('mongoose');
const PDFGenerator = require('./utils/pdfGenerator');
const Order = require('./models/Order');
const User = require('./models/User');
const Game = require('./models/Game');
const fs = require('fs');
const path = require('path');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/gamebazaar')
  .then(() => console.log('MongoDB Connected: localhost'))
  .catch(err => console.log(err));

async function testPDFFormat() {
  try {
    console.log('🧪 Testing Updated PDF Format...');
    
    // Find a test order
    console.log('📋 Finding test order...');
    const order = await Order.findOne({ isPaid: true })
      .populate('user', 'name email')
      .populate('orderItems.game', 'title platform images');
    
    if (!order) {
      console.log('❌ No test order found');
      return;
    }
    
    console.log(`📦 Using order: ${order._id}`);
    console.log(`👤 Customer: ${order.user.name} (${order.user.email})`);
    console.log(`💰 Total: ৳${order.totalPrice}`);
    console.log(`📊 Status: ${order.status}`);
    console.log(`🎮 Items: ${order.orderItems.length}`);
    
    // Check for null games
    const nullGames = order.orderItems.filter(item => !item.game);
    const validGames = order.orderItems.filter(item => item.game);
    
    console.log(`✅ Valid games: ${validGames.length}`);
    console.log(`❌ Null games: ${nullGames.length}`);
    
    // Generate PDF
    console.log('\n📄 Testing PDF generation...');
    const pdfBuffer = await PDFGenerator.generateOrderReceiptPDF(order, order.user);
    
    // Save PDF for manual inspection
    const filename = `test-receipt-${order._id}.pdf`;
    fs.writeFileSync(filename, pdfBuffer);
    console.log(`✅ PDF saved as: ${filename}`);
    console.log(`📊 PDF size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
    
    // Test HTML generation to check formatting
    console.log('\n🎨 Testing HTML formatting...');
    const html = PDFGenerator.generateReceiptHTML(order, order.user);
    
    // Check key frontend-like features
    const checks = [
      { test: html.includes('...'), desc: 'Order ID truncated format' },
      { test: html.includes('items'), desc: 'Item count display' },
      { test: html.includes('available') && nullGames.length > 0, desc: 'Availability info (if applicable)' },
      { test: html.includes('status-' + order.status), desc: 'Status styling' },
      { test: html.includes('Game no longer available') && nullGames.length > 0, desc: 'Null game handling (if applicable)' },
      { test: html.includes('grid'), desc: 'Modern grid layout' },
      { test: html.includes('gradient'), desc: 'Modern gradients' },
      { test: html.includes('border-radius'), desc: 'Rounded corners' }
    ];
    
    console.log('\n🔍 Frontend-like features:');
    checks.forEach(check => {
      if (check.desc.includes('(if applicable)') && check.desc.includes('null') && nullGames.length === 0) {
        console.log('⚪', check.desc.replace(' (if applicable)', ' - N/A (no null games)'));
      } else if (check.desc.includes('(if applicable)') && check.desc.includes('available') && nullGames.length === 0) {
        console.log('⚪', check.desc.replace(' (if applicable)', ' - N/A (all games available)'));
      } else {
        console.log(check.test ? '✅' : '❌', check.desc);
      }
    });
    
    // Check specific formatting elements
    console.log('\n🎯 Specific format checks:');
    const orderIdMatch = html.match(/Order ([a-f0-9]{10}\.\.\.)/);
    if (orderIdMatch) {
      console.log('✅ Order ID format:', orderIdMatch[1]);
    } else {
      console.log('❌ Order ID format not found');
    }
    
    const itemCountMatch = html.match(/(\d+) items?/);
    if (itemCountMatch) {
      console.log('✅ Item count format:', itemCountMatch[0]);
    } else {
      console.log('❌ Item count format not found');
    }
    
    if (order.approvedBy) {
      const approvalMatch = html.includes('Approved by');
      console.log(approvalMatch ? '✅' : '❌', 'Approval info display');
    } else {
      console.log('⚪ Approval info - N/A (not approved)');
    }
    
    console.log('\n🎉 PDF format test completed!');
    console.log(`💾 Check the generated file: ${filename}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    mongoose.connection.close();
  }
}

// Run the test
testPDFFormat();
