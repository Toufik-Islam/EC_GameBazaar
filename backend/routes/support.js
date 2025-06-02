const express = require('express');
const router = express.Router();
const { submitSupportTicket } = require('../controllers/support');

// @route   POST /api/support/ticket
// @desc    Submit a support ticket
// @access  Public
router.post('/ticket', submitSupportTicket);

module.exports = router;
