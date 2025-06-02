// Comprehensive test for the support form functionality
const testSupportFormIntegration = async () => {
  console.log('🧪 Testing Support Form Integration...\n');

  // Test case 1: Valid form submission
  console.log('Test 1: Valid form submission');
  try {
    const validData = {
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      orderNumber: "GB-2024-001234",
      category: "technical",
      subject: "Game installation issue",
      description: "I'm having trouble installing the game I purchased. The installer keeps crashing at 50% completion. I've tried restarting my computer and running as administrator but the issue persists. My system specs are: Windows 11, 16GB RAM, GTX 3070."
    };

    const response = await fetch('http://localhost:5000/api/support/ticket', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validData)
    });

    const result = await response.json();
    
    if (response.status === 200 && result.success) {
      console.log('✅ PASSED: Valid form submission accepted');
      console.log(`   Message: ${result.message}`);
    } else {
      console.log('❌ FAILED: Valid form submission rejected');
      console.log(`   Error: ${result.error}`);
    }
  } catch (error) {
    console.log('❌ ERROR in Test 1:', error.message);
  }

  // Test case 2: Missing required fields
  console.log('\nTest 2: Missing required fields');
  try {
    const invalidData = {
      name: "",
      email: "test@example.com",
      orderNumber: "",
      category: "",
      subject: "",
      description: ""
    };

    const response = await fetch('http://localhost:5000/api/support/ticket', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidData)
    });

    const result = await response.json();
    
    if (response.status === 400 && !result.success) {
      console.log('✅ PASSED: Missing required fields properly rejected');
      console.log(`   Error: ${result.error}`);
    } else {
      console.log('❌ FAILED: Should reject missing required fields');
    }
  } catch (error) {
    console.log('❌ ERROR in Test 2:', error.message);
  }

  // Test case 3: Invalid email format
  console.log('\nTest 3: Invalid email format');
  try {
    const invalidEmailData = {
      name: "Bob Smith",
      email: "invalid-email-format",
      orderNumber: "GB-123",
      category: "account",
      subject: "Password reset",
      description: "I need help resetting my password."
    };

    const response = await fetch('http://localhost:5000/api/support/ticket', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidEmailData)
    });

    const result = await response.json();
    
    if (response.status === 400 && !result.success && result.error.includes('valid email')) {
      console.log('✅ PASSED: Invalid email format properly rejected');
      console.log(`   Error: ${result.error}`);
    } else {
      console.log('❌ FAILED: Should reject invalid email format');
    }
  } catch (error) {
    console.log('❌ ERROR in Test 3:', error.message);
  }

  // Test case 4: Form with optional order number
  console.log('\nTest 4: Form without order number (optional field)');
  try {
    const noOrderData = {
      name: "Carol Davis",
      email: "carol.davis@example.com",
      orderNumber: "",
      category: "product",
      subject: "Game compatibility question",
      description: "I want to know if this game is compatible with my Mac system before purchasing."
    };

    const response = await fetch('http://localhost:5000/api/support/ticket', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noOrderData)
    });

    const result = await response.json();
    
    if (response.status === 200 && result.success) {
      console.log('✅ PASSED: Form without order number accepted');
      console.log(`   Message: ${result.message}`);
    } else {
      console.log('❌ FAILED: Should accept form without order number');
      console.log(`   Error: ${result.error}`);
    }
  } catch (error) {
    console.log('❌ ERROR in Test 4:', error.message);
  }

  console.log('\n🏁 Support Form Integration Tests Complete!');
};

// Run the tests
testSupportFormIntegration();
