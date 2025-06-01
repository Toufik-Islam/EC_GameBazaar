// Test script to verify admin orders functionality
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

async function testAdminOrders() {
  try {
    console.log('🔐 Testing Admin Login...');
    
    // Step 1: Login as admin
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@gamebazaar.com',
        password: '123456'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Admin login successful');
    console.log('Admin user:', {
      id: loginData.user.id,
      name: loginData.user.name,
      role: loginData.user.role
    });

    const token = loginData.token;
    const userId = loginData.user.id;

    // Step 2: Test pending orders endpoint
    console.log('\n📋 Testing Pending Orders API...');
    const pendingResponse = await fetch(`${BASE_URL}/api/orders/pending`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-user-id': userId
      }
    });

    if (!pendingResponse.ok) {
      const errorData = await pendingResponse.json();
      throw new Error(`Pending orders failed: ${pendingResponse.status} - ${errorData.message}`);
    }

    const pendingData = await pendingResponse.json();
    console.log('✅ Pending orders API response:');
    console.log(`  - Success: ${pendingData.success}`);
    console.log(`  - Count: ${pendingData.count}`);
    console.log(`  - Orders: ${pendingData.data?.length || 0} orders returned`);

    if (pendingData.data && pendingData.data.length > 0) {
      console.log('  - Sample order:', {
        id: pendingData.data[0]._id,
        status: pendingData.data[0].status,
        isPaid: pendingData.data[0].isPaid,
        totalPrice: pendingData.data[0].totalPrice,
        user: pendingData.data[0].user.name
      });
    }

    // Step 3: Test all orders endpoint
    console.log('\n📋 Testing All Orders API...');
    const allOrdersResponse = await fetch(`${BASE_URL}/api/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-user-id': userId
      }
    });

    if (!allOrdersResponse.ok) {
      const errorData = await allOrdersResponse.json();
      throw new Error(`All orders failed: ${allOrdersResponse.status} - ${errorData.message}`);
    }

    const allOrdersData = await allOrdersResponse.json();
    console.log('✅ All orders API response:');
    console.log(`  - Success: ${allOrdersData.success}`);
    console.log(`  - Total Count: ${allOrdersData.count}`);

    // Count orders by status
    const statusCounts = {};
    allOrdersData.data?.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });

    console.log('  - Orders by status:', statusCounts);

    // Step 4: Filter processed orders (non-pending)
    const processedOrders = allOrdersData.data?.filter(
      order => order.status !== 'pending' && order.status !== 'cancelled'
    ) || [];

    console.log(`  - Processed orders count: ${processedOrders.length}`);

    console.log('\n🎉 All tests completed successfully!');
    console.log('\nSummary:');
    console.log(`  - Pending orders: ${pendingData.count || 0}`);
    console.log(`  - Processed orders: ${processedOrders.length}`);
    console.log(`  - Total orders: ${allOrdersData.count || 0}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testAdminOrders();
