const express = require('express');
const {
  createOrder,
  getOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderToPaid,
  getPendingOrders,
  approveOrder
} = require('../controllers/orders');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// User routes
router.post('/', createOrder);
router.get('/myorders', getMyOrders);
router.put('/:id/pay', updateOrderToPaid);

// Admin routes
router.get('/', authorize('admin'), getOrders);
router.get('/pending', authorize('admin'), getPendingOrders); // Specific routes BEFORE parameter routes
router.put('/:id/approve', authorize('admin'), approveOrder);
router.put('/:id/status', authorize('admin'), updateOrderStatus);

// This route must come AFTER all other specific routes to avoid conflicts
router.get('/:id', getOrderById);

module.exports = router;