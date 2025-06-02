const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Game = require('../models/Game');
const notificationUtil = require('../utils/notification');

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

    // Return order with populated games and user
    const populatedOrder = await Order.findById(order._id)
      .populate({
        path: 'orderItems.game',
        select: 'title images platform'
      })
      .populate({
        path: 'user',
        select: 'name email'
      });

    // Send order confirmation email (don't block the response if it fails)
    try {
      // Transform order data for email template
      const emailOrderData = {
        ...populatedOrder.toObject(),
        items: populatedOrder.orderItems.map(item => ({
          name: item.game ? item.game.title : 'Game no longer available',
          platform: item.game ? item.game.platform : 'N/A',
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: populatedOrder.totalPrice,
        createdAt: populatedOrder.createdAt,
        status: populatedOrder.status
      };

      await notificationUtil.sendOrderConfirmationNotification(emailOrderData);
      console.log(`✅ Order confirmation email sent to ${populatedOrder.user.email}`);
    } catch (emailError) {
      console.error(`❌ Failed to send order confirmation email:`, emailError);
      // Continue with order creation response even if email fails
    }

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

    // Count orders with null games for admin monitoring
    let ordersWithNullGames = 0;
    let totalNullGames = 0;
    
    orders.forEach(order => {
      const nullGameItems = order.orderItems.filter(item => !item.game);
      if (nullGameItems.length > 0) {
        ordersWithNullGames++;
        totalNullGames += nullGameItems.length;
      }
    });

    if (ordersWithNullGames > 0) {
      console.log(`[Admin Orders] Warning: ${ordersWithNullGames} orders contain ${totalNullGames} null game references`);
    }

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    console.error('[Admin Orders] Error fetching orders:', err);
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

    // Log any orders with null games for monitoring
    orders.forEach(order => {
      const nullGameItems = order.orderItems.filter(item => !item.game);
      if (nullGameItems.length > 0) {
        console.log(`[Order History] Order ${order._id} has ${nullGameItems.length} null game references`);
      }
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    console.error('[Order History] Error fetching user orders:', err);
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

    // Log any null games for monitoring
    const nullGameItems = order.orderItems.filter(item => !item.game);
    if (nullGameItems.length > 0) {
      console.log(`[Order Details] Order ${order._id} has ${nullGameItems.length} null game references`);
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    console.error('[Order Details] Error fetching order:', err);
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

    let order = await Order.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'name email'
      })
      .populate({
        path: 'orderItems.game',
        select: 'title images platform'
      });

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

    // Send status update notification (don't block the response if it fails)
    try {
      // Transform order data for email template  
      const emailOrderData = {
        ...order.toObject(),
        items: order.orderItems.map(item => ({
          name: item.game ? item.game.title : 'Game no longer available',
          platform: item.game ? item.game.platform : 'N/A',
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: order.totalPrice,
        createdAt: order.createdAt,
        status: status
      };

      await notificationUtil.sendOrderStatusNotification(emailOrderData, status);
      console.log(`✅ Order status update email sent to ${order.user.email} (Status: ${status})`);
    } catch (emailError) {
      console.error(`❌ Failed to send order status update email:`, emailError);
      // Continue with status update response even if email fails
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

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
exports.updateOrderToPaid = async (req, res) => {
  try {
    const { 
      paymentResult,
      paymentMethod = 'creditCard' // Default if not provided
    } = req.body;

    console.log('[Payment Process] Order payment initiated:', {
      orderId: req.params.id,
      paymentMethod,
      paymentResult: paymentResult ? { ...paymentResult } : 'No payment result provided'
    });

    let order = await Order.findById(req.params.id);

    // Check if order exists
    if (!order) {
      console.log('[Payment Process] Order not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: `Order not found with id of ${req.params.id}`
      });
    }

    // Check if user is admin or the order belongs to user
    if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
      console.log('[Payment Process] Unauthorized payment attempt:', {
        orderId: req.params.id,
        requestUserId: req.user.id,
        orderUserId: order.user.toString()
      });
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    // Update payment info
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: paymentResult?.id || 'payment_id',
      status: paymentResult?.status || 'completed',
      update_time: paymentResult?.update_time || new Date().toISOString(),
      email_address: paymentResult?.email_address || req.user.email
    };
    
    // Update payment method if provided
    if (paymentMethod) {
      order.paymentMethod = paymentMethod;
    }
    
    // Mark order as pending for admin approval
    order.status = 'pending';    console.log('[Payment Process] Updating order with payment info:', {
      orderId: order._id,
      status: 'pending',
      isPaid: true,
      paidAt: new Date().toISOString()
    });

    await order.save();
    console.log('[Payment Process] Order successfully marked as paid:', order._id);

    // Return the updated order with populated fields
    const updatedOrder = await Order.findById(order._id)
      .populate({
        path: 'user',
        select: 'name email'
      })
      .populate({
        path: 'orderItems.game',
        select: 'title images platform'
      });

    // Send payment confirmation notification (don't block the response if it fails)
    try {
      // Transform order data for email template  
      const emailOrderData = {
        ...updatedOrder.toObject(),
        items: updatedOrder.orderItems.map(item => ({
          name: item.game ? item.game.title : 'Game no longer available',
          platform: item.game ? item.game.platform : 'N/A',
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: updatedOrder.totalPrice,
        createdAt: updatedOrder.createdAt,
        status: 'pending'
      };

      await notificationUtil.sendOrderStatusNotification(emailOrderData, 'pending');
      console.log(`✅ Payment confirmation email sent to ${updatedOrder.user.email}`);
    } catch (emailError) {
      console.error(`❌ Failed to send payment confirmation email:`, emailError);
      // Continue with payment response even if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Payment successful. Order is pending admin approval.',
      data: updatedOrder
    });
  } catch (err) {
    console.error('[Payment Process] Error in payment processing:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get all pending orders
// @route   GET /api/orders/pending
// @access  Private/Admin
exports.getPendingOrders = async (req, res) => {
  try {
    console.log('[Admin Panel] Fetching pending orders, requested by:', {
      userId: req.user.id,
      userRole: req.user.role
    });
    
    // First, check if there are any orders with pending status
    const totalPendingCount = await Order.countDocuments({ status: 'pending' });
    const totalPaidCount = await Order.countDocuments({ isPaid: true });
    const bothConditionsCount = await Order.countDocuments({ 
      status: 'pending', 
      isPaid: true 
    });
    
    console.log('[Admin Panel] Current order counts in database:', {
      totalOrders: await Order.countDocuments(),
      pendingStatusCount: totalPendingCount,
      paidOrdersCount: totalPaidCount,
      pendingAndPaidCount: bothConditionsCount
    });

    // Try to find all pending and paid orders
    const pendingOrders = await Order.find({ 
      status: 'pending',
      isPaid: true 
    }).populate({
      path: 'user',
      select: 'name email'
    }).populate({
      path: 'orderItems.game',
      select: 'title images price'
    });

    console.log('[Admin Panel] Pending orders found:', {
      count: pendingOrders.length,
      orderIds: pendingOrders.map(order => order._id.toString())
    });

    if (pendingOrders.length === 0) {
      // If no pending orders, let's check if there are any pending orders without 'isPaid: true'
      // This will help diagnose if there's an issue with the payment process
      const onlyPendingOrders = await Order.find({ status: 'pending' })
        .select('_id isPaid paidAt createdAt');
      
      if (onlyPendingOrders.length > 0) {
        console.log('[Admin Panel] Orders with only pending status (paid status may be incorrect):', {
          count: onlyPendingOrders.length,
          orders: onlyPendingOrders.map(o => ({
            id: o._id.toString(),
            isPaid: o.isPaid,
            paidAt: o.paidAt,
            createdAt: o.createdAt
          }))
        });
      }
    }
    
    // Return success response with pending orders
    return res.status(200).json({
      success: true,
      count: pendingOrders.length,
      data: pendingOrders
    });
    
  } catch (err) {
    console.error('[Admin Panel] Error fetching pending orders:', err);
    return res.status(500).json({
      success: false,
      message: `Error fetching pending orders: ${err.message}`
    });
  }
};

// @desc    Approve order
// @route   PUT /api/orders/:id/approve
// @access  Private/Admin
exports.approveOrder = async (req, res) => {
  try {
    console.log('[Admin Panel] Approving order:', req.params.id);
    const { adminName, adminEmail } = req.body;
    
    let order = await Order.findById(req.params.id).populate({
      path: 'user',
      select: 'name email'
    });

    // Check if order exists
    if (!order) {
      console.log('[Admin Panel] Order not found for approval:', req.params.id);
      return res.status(404).json({
        success: false,
        message: `Order not found with id of ${req.params.id}`
      });
    }

    // Verify the order is in pending status and has been paid
    if (order.status !== 'pending' || !order.isPaid) {
      console.log('[Admin Panel] Cannot approve order - invalid status or payment:', {
        orderId: order._id.toString(),
        status: order.status,
        isPaid: order.isPaid
      });
      return res.status(400).json({
        success: false,
        message: 'Only pending and paid orders can be approved'
      });
    }    // Update status to processing (this is the valid enum value after approval)
    order.status = 'processing';
    
    // Record approval timestamp
    order.approvedAt = Date.now();
    
    // Record admin who approved the order
    order.approvedBy = {
      name: adminName || req.user.name,
      email: adminEmail || req.user.email
    };

    await order.save();
    console.log('[Admin Panel] Order marked as processing (approved):', order._id.toString());

    // Return the updated order with populated fields
    const approvedOrder = await Order.findById(order._id)
      .populate({
        path: 'user',
        select: 'name email'
      })
      .populate({
        path: 'orderItems.game',
        select: 'title images platform'
      });

    // Notify the user about order approval - do this safely
    try {
      // Transform order data for email template  
      const emailOrderData = {
        ...approvedOrder.toObject(),
        items: approvedOrder.orderItems.map(item => ({
          name: item.game ? item.game.title : 'Game no longer available',
          platform: item.game ? item.game.platform : 'N/A',
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: approvedOrder.totalPrice,
        createdAt: approvedOrder.createdAt,
        status: 'processing'
      };

      // Send email with 'approved' status for user-friendly message, but order status is 'processing'
      await notificationUtil.sendOrderStatusNotification(emailOrderData, 'approved');
      console.log('[Admin Panel] Order approval notification sent');
    } catch (notificationError) {
      console.error('[Admin Panel] Failed to send order approval notification:', notificationError);
      // Continue with the response even if notification fails
    }
    
    res.status(200).json({
      success: true,
      message: 'Order has been approved successfully',
      data: approvedOrder
    });
  } catch (err) {
    console.error('[Admin Panel] Error approving order:', err);
    res.status(500).json({
      success: false,
      message: `Error approving order: ${err.message}`
    });
  }
};