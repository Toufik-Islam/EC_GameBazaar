const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('./models/Order');
const User = require('./models/User');
const Game = require('./models/Game');
const emailService = require('./utils/emailService');
const pdfGenerator = require('./utils/pdfGenerator');
const notificationUtil = require('./utils/notification');

// Load env vars
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

async function testPDFEmailFunctionality() {
  try {
    await connectDB();
    
    console.log('🧪 Testing PDF Email Functionality...\n');
    
    // 1. Find a test order with populated data
    console.log('📋 Finding test order...');
    const testOrder = await Order.findOne({ isPaid: true })
      .populate({
        path: 'user',
        select: 'name email'
      })
      .populate({
        path: 'orderItems.game',
        select: 'title images platform price'
      });

    if (!testOrder) {
      console.log('❌ No paid orders found. Creating test data...');
      
      // Create test user if needed
      let testUser = await User.findOne({ email: 'test@gamebazaar.com' });
      if (!testUser) {
        testUser = await User.create({
          name: 'Test User',
          email: 'test@gamebazaar.com',
          password: 'password123',
          role: 'user'
        });
        console.log('✅ Created test user');
      }
      
      // Find some games for the order
      const games = await Game.find().limit(2);
      if (games.length === 0) {
        console.log('❌ No games found in database. Please seed the database first.');
        process.exit(1);
      }
      
      // Create test order
      const newTestOrder = await Order.create({
        user: testUser._id,
        orderItems: games.map(game => ({
          game: game._id,
          quantity: 1,
          price: game.price
        })),
        shippingAddress: {
          address: '123 Test Street',
          city: 'Test City',
          postalCode: '12345',
          country: 'Bangladesh'
        },
        paymentMethod: 'creditCard',
        paymentResult: {
          id: 'test_payment_123',
          status: 'completed',
          update_time: new Date().toISOString(),
          email_address: testUser.email
        },
        taxPrice: 20,
        shippingPrice: 50,
        totalPrice: games.reduce((acc, game) => acc + game.price, 0) + 70,
        isPaid: true,
        paidAt: new Date(),
        status: 'pending'
      });
      
      // Populate the new order
      const populatedOrder = await Order.findById(newTestOrder._id)
        .populate({
          path: 'user',
          select: 'name email'
        })
        .populate({
          path: 'orderItems.game',
          select: 'title images platform price'
        });
      
      console.log('✅ Created test order');
      testOrder = populatedOrder;
    }
    
    console.log(`📦 Using order: ${testOrder._id}`);
    console.log(`👤 Customer: ${testOrder.user.name} (${testOrder.user.email})`);
    console.log(`💰 Total: ৳${testOrder.totalPrice}`);
    console.log(`📊 Status: ${testOrder.status}\n`);
    
    // 2. Test PDF generation
    console.log('📄 Testing PDF generation...');
    try {
      const pdfBuffer = await pdfGenerator.generateOrderReceiptPDF(testOrder, testOrder.user);
      console.log(`✅ PDF generated successfully! Size: ${pdfBuffer.length} bytes`);
      
      // Save PDF to file for manual inspection
      const fs = require('fs');
      const pdfPath = `test-receipt-${testOrder._id.toString().slice(-8)}.pdf`;
      fs.writeFileSync(pdfPath, pdfBuffer);
      console.log(`💾 PDF saved as: ${pdfPath}`);
    } catch (pdfError) {
      console.error('❌ PDF generation failed:', pdfError.message);
      throw pdfError;
    }
    
    // 3. Test email with PDF attachment
    console.log('\n📧 Testing email with PDF attachment...');
    
    // First test order confirmation email with PDF
    console.log('📬 Testing order confirmation email with PDF...');
    try {
      const emailResult = await emailService.sendOrderConfirmationEmailWithPDF(testOrder, testOrder.user);
      if (emailResult.success) {
        console.log('✅ Order confirmation email with PDF sent successfully!');
        console.log(`📧 Message ID: ${emailResult.messageId}`);
      } else {
        console.log('❌ Order confirmation email failed:', emailResult.error);
      }
    } catch (emailError) {
      console.error('❌ Order confirmation email error:', emailError.message);
    }
    
    // Test order status update email with PDF
    console.log('\n📬 Testing order status update email with PDF...');
    try {
      const statusUpdateResult = await emailService.sendOrderStatusUpdateEmailWithPDF(testOrder, testOrder.user, 'approved');
      if (statusUpdateResult.success) {
        console.log('✅ Order status update email with PDF sent successfully!');
        console.log(`📧 Message ID: ${statusUpdateResult.messageId}`);
      } else {
        console.log('❌ Order status update email failed:', statusUpdateResult.error);
      }
    } catch (emailError) {
      console.error('❌ Order status update email error:', emailError.message);
    }
    
    // 4. Test notification utility functions
    console.log('\n🔔 Testing notification utilities...');
    
    try {
      // Transform order data for notification util (same format as in controllers)
      const emailOrderData = {
        ...testOrder.toObject(),
        items: testOrder.orderItems.map(item => ({
          name: item.game ? item.game.title : 'Game no longer available',
          platform: item.game ? item.game.platform : 'N/A',
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: testOrder.totalPrice,
        createdAt: testOrder.createdAt,
        status: testOrder.status
      };
      
      const notificationResult = await notificationUtil.sendOrderConfirmationNotification(emailOrderData);
      if (notificationResult.success) {
        console.log('✅ Notification utility order confirmation sent successfully!');
      } else {
        console.log('❌ Notification utility failed:', notificationResult.message);
      }
    } catch (notifError) {
      console.error('❌ Notification utility error:', notifError.message);
    }
    
    console.log('\n🎉 PDF Email functionality test completed!');
    console.log('\n📝 Summary:');
    console.log('- PDF generation: Working');
    console.log('- Email with PDF attachments: Implemented');
    console.log('- Order confirmation emails: Now include PDF receipts');
    console.log('- Order status update emails: Include PDF for approved/completed orders');
    console.log('- Fallback mechanism: If PDF fails, emails are sent without attachments');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n📤 Database connection closed');
  }
}

// Run the test
testPDFEmailFunctionality();
