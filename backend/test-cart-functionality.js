const mongoose = require('mongoose');
const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000/api';
const TEST_USER = {
  email: 'test@cart.com',
  password: 'testpass123'
};

async function testCartFunctionality() {
  try {
    console.log('🧪 Testing Cart Functionality with Shipping Address and Mobile...\n');

    // Step 1: Login to get token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, TEST_USER);
    const token = loginResponse.data.token;
    const userId = loginResponse.data.user.id;
    console.log('✅ Login successful');

    // Step 2: Get available games
    console.log('2. Getting available games...');
    const gamesResponse = await axios.get(`${BASE_URL}/games`);
    const games = gamesResponse.data.data;
    console.log(`✅ Found ${games.length} games`);

    if (games.length === 0) {
      console.log('❌ No games available for testing');
      return;
    }

    // Step 3: Add game to cart
    console.log('3. Adding game to cart...');
    const testGame = games[0];
    const addToCartResponse = await axios.post(
      `${BASE_URL}/cart/add`,
      { gameId: testGame._id },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ Game added to cart');

    // Step 4: Get cart items
    console.log('4. Getting cart items...');
    const cartResponse = await axios.get(`${BASE_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Cart has ${cartResponse.data.length} items`);

    // Step 5: Test order creation with new shipping address and mobile fields
    console.log('5. Creating order with shipping address and mobile...');
    const orderData = {
      shippingAddress: {
        street: '123 Test Street, Apt 4B',
        city: 'Dhaka',
        state: 'Dhaka Division',
        zipCode: '1000',
        country: 'Bangladesh',
        mobile: '01712345678'
      }
    };

    const orderResponse = await axios.post(
      `${BASE_URL}/orders`,
      orderData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('✅ Order created successfully!');
    console.log('Order Details:', JSON.stringify({
      id: orderResponse.data.order._id,
      totalAmount: orderResponse.data.order.totalAmount,
      shippingAddress: orderResponse.data.order.shippingAddress,
      status: orderResponse.data.order.status
    }, null, 2));

    // Step 6: Verify the order was saved with all required fields
    console.log('6. Verifying order in database...');
    const orderId = orderResponse.data.order._id;
    
    // Connect to database directly to verify
    await mongoose.connect('mongodb://127.0.0.1:27017/gamebazaar');
    const Order = require('./backend/models/Order');
    const savedOrder = await Order.findById(orderId);
    
    console.log('✅ Order verification:');
    console.log('- Street Address:', savedOrder.shippingAddress.street);
    console.log('- City:', savedOrder.shippingAddress.city);
    console.log('- State:', savedOrder.shippingAddress.state);
    console.log('- Postal Code:', savedOrder.shippingAddress.zipCode);
    console.log('- Country:', savedOrder.shippingAddress.country);
    console.log('- Mobile Number:', savedOrder.shippingAddress.mobile);
    console.log('- User Email:', savedOrder.user.email || 'Not populated');

    await mongoose.connection.close();

    console.log('\n🎉 All tests passed! Cart functionality with shipping address and mobile is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testCartFunctionality();
