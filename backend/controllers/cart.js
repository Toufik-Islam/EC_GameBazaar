const Cart = require('../models/Cart');
const Game = require('../models/Game');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate({
      path: 'items.game',
      select: 'title price images discountPrice stock'
    });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [],
        totalPrice: 0
      });
    }

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addItemToCart = async (req, res) => {
  try {
    const { gameId, quantity } = req.body;

    // Validate the game exists
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    // Check if we have enough stock
    if (game.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Not enough stock available'
      });
    }

    // Get user cart or create if doesn't exist
    let cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [],
        totalPrice: 0
      });
    }

    // Check if item already in cart
    const itemIndex = cart.items.findIndex(item => 
      item.game.toString() === gameId
    );

    // Get the price (use discountPrice if available, otherwise regular price)
    const price = game.discountPrice > 0 ? game.discountPrice : game.price;

    if (itemIndex > -1) {
      // Item exists in cart, update the quantity
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].price = price;
    } else {
      // Item not in cart, add new item
      cart.items.push({
        game: gameId,
        quantity,
        price
      });
    }

    // Save cart
    await cart.save();

    // Return populated cart
    cart = await Cart.findById(cart._id).populate({
      path: 'items.game',
      select: 'title price images discountPrice stock'
    });

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const itemId = req.params.itemId;

    // Find user cart
    let cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex(item => 
      item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    // Get the game to check stock
    const game = await Game.findById(cart.items[itemIndex].game);
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    // Check if we have enough stock
    if (game.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Not enough stock available'
      });
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity;

    // Save cart
    await cart.save();

    // Return populated cart
    cart = await Cart.findById(cart._id).populate({
      path: 'items.game',
      select: 'title price images discountPrice stock'
    });

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
exports.removeCartItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;

    // Find user cart
    let cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Remove item from cart
    cart.items = cart.items.filter(item => 
      item._id.toString() !== itemId
    );

    // Save cart
    await cart.save();

    // Return populated cart
    cart = await Cart.findById(cart._id).populate({
      path: 'items.game',
      select: 'title price images discountPrice stock'
    });

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    // Find user cart
    let cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Clear items
    cart.items = [];
    
    // Save cart
    await cart.save();

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};