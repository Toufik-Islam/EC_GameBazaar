const express = require('express');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkGameInWishlist
} = require('../controllers/wishlist');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Wishlist routes
router.get('/', getWishlist);
router.post('/', addToWishlist);
router.get('/check/:gameId', checkGameInWishlist);
router.delete('/:gameId', removeFromWishlist);
router.delete('/', clearWishlist);

module.exports = router;