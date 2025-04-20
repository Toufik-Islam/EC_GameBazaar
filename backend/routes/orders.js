const express = require('express');
const {
  createOrder,
  getOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderToPaid
} = require('../controllers/orders');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// User routes
router.post('/', createOrder);
router.get('/myorders', getMyOrders);
router.put('/:id/pay', updateOrderToPaid);
router.get('/:id', getOrderById);

// Admin routes
router.get('/', authorize('admin'), getOrders);
router.put('/:id/status', authorize('admin'), updateOrderStatus);

module.exports = router;