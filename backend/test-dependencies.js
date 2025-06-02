// Test the dependencies of EmailService
console.log('Testing EmailService dependencies...');

try {
  console.log('1. Testing nodemailer...');
  const nodemailer = require('nodemailer');
  console.log('✅ nodemailer loaded');
  
  console.log('2. Testing pdfGenerator...');
  const pdfGenerator = require('./utils/pdfGenerator');
  console.log('✅ pdfGenerator loaded');
  
  console.log('3. Testing EmailService class definition...');
  // Let's see if the issue is in the class definition itself
  class TestEmailService {
    constructor() {
      console.log('TestEmailService constructor called');
      this.test = 'working';
    }
    
    testMethod() {
      return 'test method works';
    }
  }
  
  console.log('4. Testing class instantiation...');
  const testInstance = new TestEmailService();
  console.log('Test instance:', testInstance);
  console.log('Test method:', testInstance.testMethod());
  
  console.log('5. Testing module export pattern...');
  const exported = new TestEmailService();
  console.log('Exported instance:', exported);
  
} catch (error) {
  console.error('Error in dependency test:', error);
}
