const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Order = require('./models/Order');
const User = require('./models/User');

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');
    
    console.log('📋 Checking users...');
    const users = await User.find({}).select('name email _id');
    console.log(`Users found: ${users.length}`);
    users.forEach((user, i) => {
      console.log(`  ${i+1}. ${user.name} (${user.email}) - ID: ${user._id}`);
    });
    
    console.log('\n📦 Checking order user IDs...');
    const orders = await Order.find({}).select('user _id').limit(5);
    console.log('Sample order user IDs:');
    orders.forEach((order, i) => {
      console.log(`  Order ${i+1}: ${order._id} - User: ${order.user}`);
    });
    
    // Check if any user has orders
    console.log('\n🔍 Checking which users have orders...');
    for (const user of users) {
      const userOrdersCount = await Order.countDocuments({ user: user._id });
      console.log(`  ${user.name}: ${userOrdersCount} orders`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();
