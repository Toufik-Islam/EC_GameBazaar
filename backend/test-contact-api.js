// Test script for contact form submission
const testContactAPI = async () => {
  try {
    const testData = {
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@example.com",
      subject: "Business Partnership Inquiry",
      message: "Hello GameBazaar team,\n\nI am interested in discussing a potential business partnership with your company. We are a gaming accessories manufacturer and would like to explore opportunities for collaboration.\n\nPlease let me know if you would be interested in a meeting to discuss this further.\n\nBest regards,\nJohn Smith\nCEO, Gaming Accessories Inc."
    };

    console.log('Testing contact form submission...');
    console.log('Test data:', testData);

    const response = await fetch('http://localhost:5000/api/support/contact', {
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
      console.log('✅ Test PASSED: Contact form submitted successfully');
    } else {
      console.log('❌ Test FAILED:', result.error);
    }

  } catch (error) {
    console.error('❌ Test ERROR:', error.message);
  }
};

// Test with missing required fields
const testContactValidation = async () => {
  try {
    const invalidData = {
      firstName: "",
      lastName: "Smith",
      email: "invalid-email",
      subject: "",
      message: ""
    };

    console.log('\nTesting contact form validation...');
    
    const response = await fetch('http://localhost:5000/api/support/contact', {
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

// Test comprehensive contact form scenarios
const testContactFormIntegration = async () => {
  console.log('🧪 Testing Contact Form Integration...\n');

  // Test case 1: Valid contact form submission
  console.log('Test 1: Valid contact form submission');
  try {
    const validData = {
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@example.com",
      subject: "Game recommendation request",
      message: "Hi there! I'm looking for recommendations for strategy games that would be suitable for beginners. I'm new to gaming and would appreciate some guidance on where to start. Thank you!"
    };

    const response = await fetch('http://localhost:5000/api/support/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validData)
    });

    const result = await response.json();
    
    if (response.status === 200 && result.success) {
      console.log('✅ PASSED: Valid contact form submission accepted');
      console.log(`   Message: ${result.message}`);
    } else {
      console.log('❌ FAILED: Valid contact form submission rejected');
      console.log(`   Error: ${result.error}`);
    }
  } catch (error) {
    console.log('❌ ERROR in Test 1:', error.message);
  }

  // Test case 2: Missing required fields
  console.log('\nTest 2: Missing required fields');
  try {
    const invalidData = {
      firstName: "",
      lastName: "",
      email: "test@example.com",
      subject: "",
      message: ""
    };

    const response = await fetch('http://localhost:5000/api/support/contact', {
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
      firstName: "Mike",
      lastName: "Wilson",
      email: "not-a-valid-email",
      subject: "Question about games",
      message: "I have some questions about your games."
    };

    const response = await fetch('http://localhost:5000/api/support/contact', {
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

  console.log('\n🏁 Contact Form Integration Tests Complete!');
};

// Run the tests
testContactAPI();
setTimeout(testContactValidation, 2000);
setTimeout(testContactFormIntegration, 4000);
