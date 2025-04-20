import express from 'express';
import * as orderController from '../controllers/order.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = express.Router();

// All order routes require authentication
router.use(protect);

// User routes
router.get('/my-orders', orderController.getUserOrders);
router.post('/', orderController.createOrder);
router.get('/:id', orderController.getOrder);

// Admin only routes
router.use(restrictTo('admin'));
router.get('/', orderController.getAllOrders);
router.patch('/:id', orderController.updateOrderStatus);

export default router;