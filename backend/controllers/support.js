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

// Submit contact form
const submitContactForm = async (req, res) => {
  try {
    const { firstName, lastName, email, subject, message } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !subject || !message) {
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

    // Send contact form email
    const result = await emailService.sendContactFormEmail({
      firstName,
      lastName,
      email,
      subject,
      message
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Your message has been sent successfully. We will get back to you soon!'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send your message. Please try again.'
      });
    }
  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

module.exports = {
  submitSupportTicket,
  submitContactForm
};
