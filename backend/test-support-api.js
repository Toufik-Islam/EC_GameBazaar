// Test script for support ticket submission
const testSupportAPI = async () => {
  try {
    const testData = {
      name: "John Doe",
      email: "john.doe@example.com",
      orderNumber: "ORD-12345",
      category: "order",
      subject: "Order delivery issue",
      description: "I haven't received my order yet and it's been 5 days since the expected delivery date. Please help me track my order."
    };

    console.log('Testing support ticket submission...');
    console.log('Test data:', testData);

    const response = await fetch('http://localhost:5000/api/support/ticket', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', result);

    if (result.success) {
      console.log('✅ Test PASSED: Support ticket submitted successfully');
    } else {
      console.log('❌ Test FAILED:', result.error);
    }

  } catch (error) {
    console.error('❌ Test ERROR:', error.message);
  }
};

// Test with missing required fields
const testValidation = async () => {
  try {
    const invalidData = {
      name: "John Doe",
      email: "invalid-email",
      category: "",
      subject: "",
      description: ""
    };

    console.log('\nTesting validation...');
    
    const response = await fetch('http://localhost:5000/api/support/ticket', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidData)
    });

    const result = await response.json();
    
    console.log('Validation test response:', result);

    if (!result.success && result.error) {
      console.log('✅ Validation test PASSED: Error handling works correctly');
    } else {
      console.log('❌ Validation test FAILED: Should have returned an error');
    }

  } catch (error) {
    console.error('❌ Validation test ERROR:', error.message);
  }
};

// Run tests
testSupportAPI();
setTimeout(testValidation, 2000);
