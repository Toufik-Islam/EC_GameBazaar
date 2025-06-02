// Test if there are any silent errors in the EmailService file
require('dotenv').config();

console.log('Testing EmailService file execution...');

// Create a wrapper to catch errors during module loading
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(...args) {
  try {
    return originalRequire.apply(this, args);
  } catch (error) {
    console.error('Module loading error:', error);
    throw error;
  }
};

try {
  console.log('Loading EmailService with error catching...');
  const emailService = require('./utils/emailService');
  console.log('EmailService loaded:', emailService);
  console.log('Keys:', Object.keys(emailService));
  console.log('Constructor:', emailService.constructor.name);
} catch (error) {
  console.error('Failed to load EmailService:', error);
}

// Restore original require
Module.prototype.require = originalRequire;
