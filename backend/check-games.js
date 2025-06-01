// Check games in database
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Game = require('./models/Game');
const Order = require('./models/Order');

const checkGames = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected\n');
    
    // Check games
    const games = await Game.find({});
    console.log(`🎮 Total games in database: ${games.length}`);
    
    if (games.length > 0) {
      console.log('✅ Sample games:');
      games.slice(0, 3).forEach((game, i) => {
        console.log(`   ${i + 1}. ${game.title} (ID: ${game._id})`);
      });
    } else {
      console.log('❌ No games found in database!');
    }
    
    // Check order game IDs
    console.log('\n🔍 Checking order game IDs...');
    const orders = await Order.find({}).limit(3);
    
    if (orders.length > 0) {
      console.log('📦 Sample order game IDs:');
      orders.forEach((order, i) => {
        console.log(`   Order ${i + 1}:`);
        order.orderItems.forEach((item, j) => {
          console.log(`     Item ${j + 1}: Game ID = ${item.game}`);
        });
      });
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkGames();
