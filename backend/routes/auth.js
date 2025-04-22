const express = require('express');
const { 
  register, 
  login, 
  getMe, 
  logout,
  updateProfile,
  changePassword
} = require('../controllers/auth');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/logout', logout);
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;