import { Request, Response, NextFunction } from 'express';
import Cart from '../models/cart.model';
import Game from '../models/game.model';
import { AppError } from '../middleware/error.middleware';

// Get user's cart
export const getCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Find cart for current user, populate game details
    let cart = await Cart.findOne({ user: req.user.id }).populate({
      path: 'items.game',
      select: 'title mainImage price discountPrice inStock',
    });

    // If cart doesn't exist, create empty cart
    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [],
        totalPrice: 0,
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        cart,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Add item to cart
export const addToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { gameId, quantity = 1 } = req.body;

    // Validate game exists and is in stock
    const game = await Game.findById(gameId);
    if (!game) {
      return next(new AppError('Game not found', 404));
    }

    if (!game.inStock || game.stockCount < quantity) {
      return next(new AppError('Game is out of stock or not enough quantity available', 400));
    }

    // Get price (use discount price if available)
    const price = game.discountPrice || game.price;

    // Find user's cart
    let cart = await Cart.findOne({ user: req.user.id });

    // If cart doesn't exist, create a new one
    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [
          {
            game: gameId,
            quantity,
            price,
          },
        ],
      });
    } else {
      // Check if game already in cart
      const existingItemIndex = cart.items.findIndex(
        (item) => item.game.toString() === gameId
      );

      if (existingItemIndex > -1) {
        // Update quantity if game already in cart
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item to cart
        cart.items.push({
          game: gameId,
          quantity,
          price,
        });
      }

      await cart.save();
    }

    // Fetch updated cart with populated game data
    cart = await Cart.findById(cart._id).populate({
      path: 'items.game',
      select: 'title mainImage price discountPrice inStock',
    });

    res.status(200).json({
      status: 'success',
      data: {
        cart,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update cart item quantity
export const updateCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    // Validate quantity
    if (!quantity || quantity < 1) {
      return next(new AppError('Quantity must be at least 1', 400));
    }

    // Find user's cart
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return next(new AppError('Cart not found', 404));
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return next(new AppError('Item not found in cart', 404));
    }

    // Get game to check stock
    const game = await Game.findById(cart.items[itemIndex].game);
    if (!game || !game.inStock || game.stockCount < quantity) {
      return next(new AppError('Game is out of stock or not enough quantity available', 400));
    }

    // Update item quantity
    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    // Fetch updated cart with populated game data
    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.game',
      select: 'title mainImage price discountPrice inStock',
    });

    res.status(200).json({
      status: 'success',
      data: {
        cart: updatedCart,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Remove item from cart
export const removeFromCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { itemId } = req.params;

    // Find user's cart
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return next(new AppError('Cart not found', 404));
    }

    // Remove item from cart
    cart.items = cart.items.filter(
      (item) => item._id.toString() !== itemId
    );

    await cart.save();

    // Fetch updated cart with populated game data
    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.game',
      select: 'title mainImage price discountPrice inStock',
    });

    res.status(200).json({
      status: 'success',
      data: {
        cart: updatedCart,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Clear cart
export const clearCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Find user's cart
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return next(new AppError('Cart not found', 404));
    }

    // Clear cart items
    cart.items = [];
    await cart.save();

    res.status(200).json({
      status: 'success',
      data: {
        cart,
      },
    });
  } catch (error) {
    next(error);
  }
};