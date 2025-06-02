const express = require('express');
const router = express.Router();
const { submitSupportTicket, submitContactForm } = require('../controllers/support');

// @route   POST /api/support/ticket
// @desc    Submit a support ticket
// @access  Public
router.post('/ticket', submitSupportTicket);

// @route   POST /api/support/contact
// @desc    Submit a contact form
// @access  Public
router.post('/contact', submitContactForm);

module.exports = router;
