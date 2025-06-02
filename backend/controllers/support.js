const emailService = require('../utils/emailService');

// Submit support ticket
const submitSupportTicket = async (req, res) => {
  try {
    const { name, email, orderNumber, category, subject, description } = req.body;

    // Validate required fields
    if (!name || !email || !category || !subject || !description) {
      return res.status(400).json({
        success: false,
        error: 'Please fill in all required fields'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      });
    }

    // Send support ticket email
    const result = await emailService.sendSupportTicketEmail({
      name,
      email,
      orderNumber,
      category,
      subject,
      description
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Support ticket submitted successfully. We will respond within 24 hours.'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to submit support ticket. Please try again.'
      });
    }
  } catch (error) {
    console.error('Support ticket submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

module.exports = {
  submitSupportTicket
};
