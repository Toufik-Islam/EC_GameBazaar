import { Request, Response, NextFunction } from 'express';
import Order from '../models/order.model';
import Cart from '../models/cart.model';
import Game from '../models/game.model';
import { AppError } from '../middleware/error.middleware';

// Get user's orders
export const getUserOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort('-createdAt')
      .populate({
        path: 'items.game',
        select: 'title mainImage',
      });

    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: {
        orders,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get a single order
export const getOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await Order.findById(req.params.id).populate({
      path: 'items.game',
      select: 'title mainImage price discountPrice',
    });

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    // Check if the order belongs to the user or if user is admin
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('You are not authorized to access this order', 403));
    }

    res.status(200).json({
      status: 'success',
      data: {
        order,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create a new order from cart
export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { paymentMethod, shippingAddress, deliveryNotes } = req.body;

    // Validate required fields
    if (!paymentMethod) {
      return next(new AppError('Payment method is required', 400));
    }

    if (!shippingAddress) {
      return next(new AppError('Shipping address is required', 400));
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate({
      path: 'items.game',
      select: 'title price discountPrice stockCount inStock',
    });

    if (!cart || cart.items.length === 0) {
      return next(new AppError('Your cart is empty', 400));
    }

    // Check if all items are in stock
    for (const item of cart.items) {
      const game = item.game as any;
      if (!game.inStock || game.stockCount < item.quantity) {
        return next(
          new AppError(`${game.title} is out of stock or not enough quantity available`, 400)
        );
      }
    }

    // Create order items from cart
    const orderItems = cart.items.map((item) => {
      const game = item.game as any;
      return {
        game: item.game,
        quantity: item.quantity,
        price: game.discountPrice || game.price,
      };
    });

    // Calculate total amount
    const totalAmount = orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Create the order
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      paymentMethod,
      shippingAddress,
      deliveryNotes,
      paymentStatus: 'pending', // Will be updated after payment processing
      status: 'processing',
    });

    // Update inventory (reduce stock counts)
    for (const item of cart.items) {
      await Game.findByIdAndUpdate(item.game, {
        $inc: { stockCount: -item.quantity, salesCount: item.quantity },
      });
    }

    // Clear the cart after successful order
    cart.items = [];
    await cart.save();

    res.status(201).json({
      status: 'success',
      data: {
        order,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, paymentStatus, trackingNumber } = req.body;

    // Find and update the order
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: status || undefined,
        paymentStatus: paymentStatus || undefined,
        trackingNumber: trackingNumber || undefined,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        order,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all orders (admin only)
export const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Parse query parameters for filtering
    const { status, paymentStatus } = req.query;
    
    // Build filter object
    const filter: any = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    // Find orders with filters
    const orders = await Order.find(filter)
      .sort('-createdAt')
      .populate({
        path: 'user',
        select: 'username email',
      })
      .populate({
        path: 'items.game',
        select: 'title mainImage',
      });

    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: {
        orders,
      },
    });
  } catch (error) {
    next(error);
  }
};