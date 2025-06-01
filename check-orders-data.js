// Database diagnostic script to check for null game references in orders
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './backend/.env' });

// Load models
const Order = require('./backend/models/Order');

// Connect to DB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for diagnostics');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }
};

const checkOrdersData = async () => {
  try {
    await connectDB();
    
    console.log('🔍 Checking orders for null game references...\n');
    
    // Get all orders with populated games
    const orders = await Order.find({}).populate({
      path: 'orderItems.game',
      select: 'title images'
    });
    
    console.log(`📊 Total orders found: ${orders.length}\n`);
    
    let problematicOrders = 0;
    let nullGameItems = 0;
    
    orders.forEach((order, orderIndex) => {
      let orderHasIssues = false;
      
      order.orderItems.forEach((item, itemIndex) => {
        if (!item.game) {
          if (!orderHasIssues) {
            console.log(`❌ Order ${orderIndex + 1} (ID: ${order._id}) has issues:`);
            console.log(`   Status: ${order.status}, isPaid: ${order.isPaid}`);
            orderHasIssues = true;
            problematicOrders++;
          }
          console.log(`   - Item ${itemIndex + 1}: game is null/undefined`);
          nullGameItems++;
        }
      });
      
      if (orderHasIssues) {
        console.log(''); // Add spacing
      }
    });
    
    if (problematicOrders === 0) {
      console.log('✅ All orders have valid game references!');
    } else {
      console.log(`🚨 Found ${problematicOrders} orders with ${nullGameItems} null game items`);
      console.log('\n💡 Recommendations:');
      console.log('1. Clean up orders with null game references');
      console.log('2. Add validation to prevent orders with deleted games');
      console.log('3. Consider soft-deleting games instead of hard-deleting');
    }
    
    // Additional check: count orders by status
    console.log('\n📈 Order Status Summary:');
    const statusCounts = {};
    orders.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} orders`);
    });
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error checking orders:', error);
    process.exit(1);
  }
};

// Run the diagnostic
checkOrdersData();
