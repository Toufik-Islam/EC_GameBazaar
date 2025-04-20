const express = require('express');
const {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart
} = require('../controllers/cart');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Cart routes
router.get('/', getCart);
router.post('/', addItemToCart);
router.put('/:itemId', updateCartItem);
router.delete('/:itemId', removeCartItem);
router.delete('/', clearCart);

module.exports = router;