const Review = require('../models/Review');
const Game = require('../models/Game');

// @desc    Get reviews for a game
// @route   GET /api/reviews?game=:gameId
// @access  Public
exports.getReviews = async (req, res) => {
  try {
    const { game } = req.query;

    // Validate game ID
    if (!game) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a game ID'
      });
    }

    // Get reviews for the specified game with populated user and reply user
    const reviews = await Review.find({ game })
      .populate({
        path: 'user',
        select: 'name avatar'
      })
      .populate({
        path: 'replies.user',
        select: 'name avatar'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { game, rating, comment } = req.body;

    // Validate game ID, rating, and comment
    if (!game || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide game ID, rating, and comment'
      });
    }

    // Check if user already reviewed this game
    const existingReview = await Review.findOne({
      user: req.user.id,
      game
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this game'
      });
    }

    // Create review
    const review = await Review.create({
      user: req.user.id,
      game,
      rating,
      comment
    });

    // Populate user data
    await review.populate({
      path: 'user',
      select: 'name avatar'
    });

    // Update game average rating and number of reviews
    await updateGameReviewStats(game);

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { id } = req.params;

    // Find review
    let review = await Review.findById(id);

    // Check if review exists
    if (!review) {
      return res.status(404).json({
        success: false,
        message: `Review not found with id of ${id}`
      });
    }

    // Make sure user is the review owner
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    // Update fields
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;

    // Save review
    await review.save();

    // Update game average rating
    await updateGameReviewStats(review.game);

    // Get populated review
    review = await Review.findById(id)
      .populate({
        path: 'user',
        select: 'name avatar'
      })
      .populate({
        path: 'replies.user',
        select: 'name avatar'
      });

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    // Find review
    const review = await Review.findById(id);

    // Check if review exists
    if (!review) {
      return res.status(404).json({
        success: false,
        message: `Review not found with id of ${id}`
      });
    }

    // Make sure user is the review owner or an admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    // Get the game ID before deleting the review
    const gameId = review.game;

    // Delete review
    await review.remove();

    // Update game average rating
    await updateGameReviewStats(gameId);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Like a review
// @route   PUT /api/reviews/:id/like
// @access  Private
exports.likeReview = async (req, res) => {
  try {
    const { id } = req.params;

    // Find review
    let review = await Review.findById(id);

    // Check if review exists
    if (!review) {
      return res.status(404).json({
        success: false,
        message: `Review not found with id of ${id}`
      });
    }

    // Check if the review has already been liked by the user
    const isLiked = review.likes.includes(req.user.id);

    if (isLiked) {
      // Unlike the review
      review.likes = review.likes.filter(
        userId => userId.toString() !== req.user.id
      );
    } else {
      // Like the review
      review.likes.push(req.user.id);
    }

    // Save review
    await review.save();

    // Get populated review
    review = await Review.findById(id)
      .populate({
        path: 'user',
        select: 'name avatar'
      })
      .populate({
        path: 'replies.user',
        select: 'name avatar'
      });

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Add a reply to a review
// @route   POST /api/reviews/:id/reply
// @access  Private
exports.addReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    // Validate comment
    if (!comment || comment.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a comment'
      });
    }

    // Find review
    let review = await Review.findById(id);

    // Check if review exists
    if (!review) {
      return res.status(404).json({
        success: false,
        message: `Review not found with id of ${id}`
      });
    }

    // Add reply
    review.replies.push({
      user: req.user.id,
      comment
    });

    // Save review
    await review.save();

    // Get populated review
    review = await Review.findById(id)
      .populate({
        path: 'user',
        select: 'name avatar'
      })
      .populate({
        path: 'replies.user',
        select: 'name avatar'
      });

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Delete a reply from a review
// @route   DELETE /api/reviews/:id/reply/:replyId
// @access  Private
exports.deleteReply = async (req, res) => {
  try {
    const { id, replyId } = req.params;

    // Find review
    let review = await Review.findById(id);

    // Check if review exists
    if (!review) {
      return res.status(404).json({
        success: false,
        message: `Review not found with id of ${id}`
      });
    }

    // Find reply
    const reply = review.replies.id(replyId);

    // Check if reply exists
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: `Reply not found with id of ${replyId}`
      });
    }

    // Make sure user is the reply owner or an admin
    if (reply.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this reply'
      });
    }

    // Remove reply
    reply.remove();

    // Save review
    await review.save();

    // Get populated review
    review = await Review.findById(id)
      .populate({
        path: 'user',
        select: 'name avatar'
      })
      .populate({
        path: 'replies.user',
        select: 'name avatar'
      });

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Helper function to update game review stats (average rating and number of reviews)
async function updateGameReviewStats(gameId) {
  // Calculate average rating
  const reviews = await Review.find({ game: gameId });
  
  if (reviews.length === 0) {
    // If no reviews, set average rating to 0
    await Game.findByIdAndUpdate(gameId, {
      averageRating: 0,
      numReviews: 0
    });
  } else {
    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    // Update game
    await Game.findByIdAndUpdate(gameId, {
      averageRating,
      numReviews: reviews.length
    });
  }
}