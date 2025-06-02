const dotenv = require('dotenv');
dotenv.config();

const emailService = require('./utils/emailService');

async function testEmailService() {
  console.log('🧪 Testing Email Service...\n');

  // Test data
  const testUser = {
    name: 'Test User',
    email: 'test@example.com', // Replace with your email for testing
    role: 'user'
  };

  const testOrder = {
    _id: '507f1f77bcf86cd799439011',
    items: [
      {
        name: 'Call of Duty: Modern Warfare',
        platform: 'PC',
        quantity: 1,
        price: 59.99
      },
      {
        name: 'FIFA 24',
        platform: 'PlayStation 5',
        quantity: 1,
        price: 69.99
      }
    ],
    totalAmount: 129.98,
    createdAt: new Date(),
    status: 'pending',
    user: testUser
  };

  try {
    console.log('1. Testing Welcome Email...');
    const welcomeResult = await emailService.sendWelcomeEmail(testUser);
    console.log('Welcome Email Result:', welcomeResult.success ? '✅ Success' : '❌ Failed');
    if (!welcomeResult.success) {
      console.log('Error:', welcomeResult.error);
    }
    console.log();

    console.log('2. Testing Order Confirmation Email...');
    const orderResult = await emailService.sendOrderConfirmationEmail(testOrder, testUser);
    console.log('Order Confirmation Result:', orderResult.success ? '✅ Success' : '❌ Failed');
    if (!orderResult.success) {
      console.log('Error:', orderResult.error);
    }
    console.log();

    console.log('3. Testing Order Status Update Email (Approved)...');
    const statusResult = await emailService.sendOrderStatusUpdateEmail(testOrder, testUser, 'approved');
    console.log('Status Update Result:', statusResult.success ? '✅ Success' : '❌ Failed');
    if (!statusResult.success) {
      console.log('Error:', statusResult.error);
    }
    console.log();

    console.log('🎉 Email testing completed!');
    
  } catch (error) {
    console.error('❌ Email testing failed:', error);
  }

  // Exit the process
  process.exit(0);
}

// Check if email configuration is set
function checkEmailConfig() {
  const requiredEnvVars = [
    'EMAIL_USERNAME',
    'EMAIL_PASSWORD',
    'EMAIL_FROM'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.log('❌ Missing email configuration:');
    missingVars.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    console.log('\n📖 Please check EMAIL_SETUP_GUIDE.md for configuration instructions.\n');
    return false;
  }

  console.log('✅ Email configuration found');
  console.log(`📧 Using email: ${process.env.EMAIL_USERNAME}`);
  console.log(`📮 From address: ${process.env.EMAIL_FROM}\n`);
  return true;
}

if (checkEmailConfig()) {
  testEmailService();
} else {
  process.exit(1);
}
