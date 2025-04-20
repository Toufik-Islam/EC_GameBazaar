import express from 'express';
import * as cartController from '../controllers/cart.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// All cart routes are protected
router.use(protect);

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.patch('/items/:itemId', cartController.updateCartItem);
router.delete('/items/:itemId', cartController.removeFromCart);
router.delete('/clear', cartController.clearCart);

export default router;