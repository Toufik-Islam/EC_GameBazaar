/**
 * Utility for handling user notifications
 * Integrates with email service for sending notifications
 */

const emailService = require('./emailService');

/**
 * Send a notification to a user
 * @param {Object} options - Notification options
 * @param {String} options.type - Type of notification (email, sms, push)
 * @param {Object} options.user - User object containing contact information
 * @param {String} options.subject - Subject of the notification
 * @param {String} options.message - Message content
 * @param {Object} options.data - Additional data relevant to the notification
 * @returns {Promise<Object>} - Result of the notification attempt
 */
exports.sendNotification = async (options) => {
  const { type = 'email', user, subject, message, data } = options;

  // Log the notification for development purposes
  console.log(`[NOTIFICATION ${type.toUpperCase()}] To: ${user.email}, Subject: ${subject}`);
  console.log(`Message: ${message}`);
  
  try {
    switch (type) {
      case 'email':
        // Use the email service for sending emails
        const emailResult = await emailService.sendEmail(
          user.email,
          subject,
          `<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #667eea;">${subject}</h2>
            <p>${message}</p>
            <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
              <p style="margin: 0; color: #666; font-size: 12px;">© 2025 GameBazaar. All rights reserved.</p>
            </div>
          </div>`,
          message
        );
        return emailResult;
      
      case 'sms':
        // Integrate with SMS service (e.g., Twilio)
        // return await sendSms({ to: user.phone, message });
        return {
          success: false,
          message: 'SMS notifications not implemented yet'
        };
      
      case 'push':
        // Integrate with push notification service
        // return await sendPushNotification({ userId: user._id, message, data });
        return {
          success: false,
          message: 'Push notifications not implemented yet'
        };
      
      default:
        throw new Error(`Unsupported notification type: ${type}`);
    }
  } catch (error) {
    console.error(`Error sending ${type} notification:`, error);
    return {
      success: false,
      message: `Failed to send ${type} notification: ${error.message}`,
      error
    };
  }
};

/**
 * Send order status notification to a user using email templates with PDF attachment
 * @param {Object} order - Order object with populated user field
 * @param {String} status - New status of the order
 * @returns {Promise<Object>} - Result of the notification attempt
 */
exports.sendOrderStatusNotification = async (order, status) => {
  try {
    // Ensure user data is populated
    if (!order.user || typeof order.user === 'string') {
      throw new Error('User data must be populated in the order object');
    }
    
    // Use the email service's template-based status update with PDF
    return await emailService.sendOrderStatusUpdateEmailWithPDF(order, order.user, status);
  } catch (error) {
    console.error('Error sending order status notification:', error);
    return {
      success: false,
      message: `Failed to send order status notification: ${error.message}`,
      error
    };
  }
};

/**
 * Send welcome email to new users
 * @param {Object} user - User object
 * @returns {Promise<Object>} - Result of the notification attempt
 */
exports.sendWelcomeNotification = async (user) => {
  try {
    return await emailService.sendWelcomeEmail(user);
  } catch (error) {
    console.error('Error sending welcome notification:', error);
    return {
      success: false,
      message: `Failed to send welcome notification: ${error.message}`,
      error
    };
  }
};

/**
 * Send order confirmation email to users with PDF attachment
 * @param {Object} order - Order object with populated user field
 * @returns {Promise<Object>} - Result of the notification attempt
 */
exports.sendOrderConfirmationNotification = async (order) => {
  try {
    // Ensure user data is populated
    if (!order.user || typeof order.user === 'string') {
      throw new Error('User data must be populated in the order object');
    }
    
    return await emailService.sendOrderConfirmationEmailWithPDF(order, order.user);
  } catch (error) {
    console.error('Error sending order confirmation notification:', error);
    return {
      success: false,
      message: `Failed to send order confirmation notification: ${error.message}`,
      error
    };
  }
};