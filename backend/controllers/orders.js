const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Game = require('../models/Game');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { 
      shippingAddress, 
      paymentMethod,
      taxPrice,
      shippingPrice,
      totalPrice
    } = req.body;

    // Get user cart
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items in cart'
      });
    }

    // Check stock for all items
    for (const item of cart.items) {
      const game = await Game.findById(item.game);
      
      if (!game) {
        return res.status(404).json({
          success: false,
          message: `Game not found: ${item.game}`
        });
      }

      if (game.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${game.title}`
        });
      }
    }

    // Create order items array
    const orderItems = await Promise.all(cart.items.map(async (item) => {
      const game = await Game.findById(item.game);
      
      // Update stock
      game.stock -= item.quantity;
      await game.save();
      
      return {
        game: item.game,
        quantity: item.quantity,
        price: item.price
      };
    }));

    // Create the order
    const order = await Order.create({
      user: req.user.id,
      orderItems,
      shippingAddress,
      paymentMethod,
      taxPrice: taxPrice || 0,
      shippingPrice: shippingPrice || 0,
      totalPrice: totalPrice || cart.totalPrice
    });

    // Clear the cart
    cart.items = [];
    await cart.save();

    // Return order with populated games
    const populatedOrder = await Order.findById(order._id).populate({
      path: 'orderItems.game',
      select: 'title images'
    });

    res.status(201).json({
      success: true,
      data: populatedOrder
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate({
      path: 'user',
      select: 'name email'
    }).populate({
      path: 'orderItems.game',
      select: 'title images'
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate({
      path: 'orderItems.game',
      select: 'title images price discountPrice'
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate({
      path: 'user',
      select: 'name email'
    }).populate({
      path: 'orderItems.game',
      select: 'title images price discountPrice'
    });

    // Check if order exists
    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order not found with id of ${req.params.id}`
      });
    }

    // Check if user is admin or the order belongs to user
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    let order = await Order.findById(req.params.id);

    // Check if order exists
    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order not found with id of ${req.params.id}`
      });
    }

    // Update status
    order.status = status;

    // If delivered, update deliveredAt
    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    await order.save();

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
exports.updateOrderToPaid = async (req, res) => {
  try {
    const { paymentResult } = req.body;

    let order = await Order.findById(req.params.id);

    // Check if order exists
    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order not found with id of ${req.params.id}`
      });
    }

    // Check if user is admin or the order belongs to user
    if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    // Update payment info
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = paymentResult;
    order.status = 'processing';

    await order.save();

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};