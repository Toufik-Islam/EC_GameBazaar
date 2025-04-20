const Wishlist = require('../models/Wishlist');
const Game = require('../models/Game');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id }).populate({
      path: 'games',
      select: 'title price images discountPrice releaseDate developer publisher genre platform'
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user.id,
        games: []
      });
    }

    res.status(200).json({
      success: true,
      count: wishlist.games.length,
      data: wishlist
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Add game to wishlist
// @route   POST /api/wishlist
// @access  Private
exports.addToWishlist = async (req, res) => {
  try {
    const { gameId } = req.body;

    // Validate the game exists
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    // Get user wishlist or create if doesn't exist
    let wishlist = await Wishlist.findOne({ user: req.user.id });
    
    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user.id,
        games: [gameId]
      });
    } else {
      // Check if game already in wishlist
      if (!wishlist.games.includes(gameId)) {
        wishlist.games.push(gameId);
        await wishlist.save();
      }
    }

    // Return populated wishlist
    wishlist = await Wishlist.findById(wishlist._id).populate({
      path: 'games',
      select: 'title price images discountPrice releaseDate developer publisher genre platform'
    });

    res.status(200).json({
      success: true,
      count: wishlist.games.length,
      data: wishlist
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Remove game from wishlist
// @route   DELETE /api/wishlist/:gameId
// @access  Private
exports.removeFromWishlist = async (req, res) => {
  try {
    const gameId = req.params.gameId;

    // Find user wishlist
    let wishlist = await Wishlist.findOne({ user: req.user.id });
    
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    // Remove game from wishlist
    wishlist.games = wishlist.games.filter(game => 
      game.toString() !== gameId
    );

    // Save wishlist
    await wishlist.save();

    // Return populated wishlist
    wishlist = await Wishlist.findById(wishlist._id).populate({
      path: 'games',
      select: 'title price images discountPrice releaseDate developer publisher genre platform'
    });

    res.status(200).json({
      success: true,
      count: wishlist.games.length,
      data: wishlist
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Private
exports.clearWishlist = async (req, res) => {
  try {
    // Find user wishlist
    let wishlist = await Wishlist.findOne({ user: req.user.id });
    
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    // Clear games
    wishlist.games = [];
    
    // Save wishlist
    await wishlist.save();

    res.status(200).json({
      success: true,
      data: wishlist
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Check if game is in wishlist
// @route   GET /api/wishlist/check/:gameId
// @access  Private
exports.checkGameInWishlist = async (req, res) => {
  try {
    const gameId = req.params.gameId;
    
    // Find user wishlist
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    
    if (!wishlist) {
      return res.status(200).json({
        success: true,
        inWishlist: false
      });
    }

    // Check if game is in wishlist
    const inWishlist = wishlist.games.some(game => 
      game.toString() === gameId
    );

    res.status(200).json({
      success: true,
      inWishlist
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};