const Review = require('../models/Review');
const Game = require('../models/Game');

// @desc    Get reviews for a game
// @route   GET /api/reviews?game=:gameId
// @access  Public
exports.getReviews = async (req, res) => {
  try {
    const { game } = req.query;
    const userId = req.user ? req.user.id : null;
    const isAdmin = req.user ? req.user.role === 'admin' : false;

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
      .populate({
        path: 'replies.nestedReplies.user',
        select: 'name avatar'
      })
      .sort({ createdAt: -1 });

    // Add canEdit flag to reviews and replies
    const enhancedReviews = reviews.map(review => {
      const reviewObj = review.toObject();
      // Add canEdit flag to review
      reviewObj.canEdit = userId && (review.user._id.toString() === userId);
      reviewObj.canDelete = userId && (review.user._id.toString() === userId || isAdmin);
      
      // Add canEdit flag to replies
      if (reviewObj.replies && reviewObj.replies.length > 0) {
        reviewObj.replies = reviewObj.replies.map(reply => {
          reply.canEdit = userId && (reply.user._id.toString() === userId);
          reply.canDelete = userId && (reply.user._id.toString() === userId || isAdmin);
          
          // Add canEdit flag to nested replies
          if (reply.nestedReplies && reply.nestedReplies.length > 0) {
            reply.nestedReplies = reply.nestedReplies.map(nestedReply => {
              nestedReply.canEdit = userId && (nestedReply.user._id.toString() === userId);
              nestedReply.canDelete = userId && (nestedReply.user._id.toString() === userId || isAdmin);
              return nestedReply;
            });
          }
          
          return reply;
        });
      }
      
      return reviewObj;
    });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: enhancedReviews
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

    // Add canEdit flag
    const reviewObj = review.toObject();
    reviewObj.canEdit = true;
    reviewObj.canDelete = true;

    res.status(201).json({
      success: true,
      data: reviewObj
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
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review. Users can only edit their own reviews.'
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
      })
      .populate({
        path: 'replies.nestedReplies.user',
        select: 'name avatar'
      });

    // Add canEdit flag
    const reviewObj = review.toObject();
    reviewObj.canEdit = true;
    reviewObj.canDelete = true;
    
    // Add canEdit flag to replies
    if (reviewObj.replies && reviewObj.replies.length > 0) {
      reviewObj.replies = reviewObj.replies.map(reply => {
        reply.canEdit = reply.user._id.toString() === req.user.id;
        reply.canDelete = reply.user._id.toString() === req.user.id || req.user.role === 'admin';
        
        // Add canEdit flag to nested replies
        if (reply.nestedReplies && reply.nestedReplies.length > 0) {
          reply.nestedReplies = reply.nestedReplies.map(nestedReply => {
            nestedReply.canEdit = nestedReply.user._id.toString() === req.user.id;
            nestedReply.canDelete = nestedReply.user._id.toString() === req.user.id || req.user.role === 'admin';
            return nestedReply;
          });
        }
        
        return reply;
      });
    }

    res.status(200).json({
      success: true,
      data: reviewObj
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
    await review.deleteOne();

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
      })
      .populate({
        path: 'replies.nestedReplies.user',
        select: 'name avatar'
      });

    // Add canEdit flag
    const reviewObj = review.toObject();
    reviewObj.canEdit = review.user._id.toString() === req.user.id;
    reviewObj.canDelete = review.user._id.toString() === req.user.id || req.user.role === 'admin';
    
    // Add canEdit flag to replies
    if (reviewObj.replies && reviewObj.replies.length > 0) {
      reviewObj.replies = reviewObj.replies.map(reply => {
        reply.canEdit = reply.user._id.toString() === req.user.id;
        reply.canDelete = reply.user._id.toString() === req.user.id || req.user.role === 'admin';
        
        // Add canEdit flag to nested replies
        if (reply.nestedReplies && reply.nestedReplies.length > 0) {
          reply.nestedReplies = reply.nestedReplies.map(nestedReply => {
            nestedReply.canEdit = nestedReply.user._id.toString() === req.user.id;
            nestedReply.canDelete = nestedReply.user._id.toString() === req.user.id || req.user.role === 'admin';
            return nestedReply;
          });
        }
        
        return reply;
      });
    }

    res.status(200).json({
      success: true,
      data: reviewObj
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
    const newReply = {
      user: req.user.id,
      comment,
      nestedReplies: []
    };
    
    review.replies.push(newReply);

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
      })
      .populate({
        path: 'replies.nestedReplies.user',
        select: 'name avatar'
      });

    // Add canEdit flag
    const reviewObj = review.toObject();
    reviewObj.canEdit = review.user._id.toString() === req.user.id;
    reviewObj.canDelete = review.user._id.toString() === req.user.id || req.user.role === 'admin';
    
    // Add canEdit flag to replies
    if (reviewObj.replies && reviewObj.replies.length > 0) {
      reviewObj.replies = reviewObj.replies.map(reply => {
        reply.canEdit = reply.user._id.toString() === req.user.id;
        reply.canDelete = reply.user._id.toString() === req.user.id || req.user.role === 'admin';
        
        // Add canEdit flag to nested replies
        if (reply.nestedReplies && reply.nestedReplies.length > 0) {
          reply.nestedReplies = reply.nestedReplies.map(nestedReply => {
            nestedReply.canEdit = nestedReply.user._id.toString() === req.user.id;
            nestedReply.canDelete = nestedReply.user._id.toString() === req.user.id || req.user.role === 'admin';
            return nestedReply;
          });
        }
        
        return reply;
      });
    }

    res.status(200).json({
      success: true,
      data: reviewObj
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Add a nested reply to an existing reply
// @route   POST /api/reviews/:id/reply/:replyId
// @access  Private
exports.addNestedReply = async (req, res) => {
  try {
    const { id, replyId } = req.params;
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

    // Find the parent reply
    const parentReply = review.replies.id(replyId);
    
    // Check if parent reply exists
    if (!parentReply) {
      return res.status(404).json({
        success: false,
        message: `Reply not found with id of ${replyId}`
      });
    }

    // Create nested reply
    const nestedReply = {
      user: req.user.id,
      comment,
      createdAt: Date.now()
    };

    // Add nested reply to parent reply
    parentReply.nestedReplies.push(nestedReply);

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
      })
      .populate({
        path: 'replies.nestedReplies.user',
        select: 'name avatar'
      });

    // Add canEdit flag
    const reviewObj = review.toObject();
    reviewObj.canEdit = review.user._id.toString() === req.user.id;
    reviewObj.canDelete = review.user._id.toString() === req.user.id || req.user.role === 'admin';
    
    // Add canEdit flag to replies
    if (reviewObj.replies && reviewObj.replies.length > 0) {
      reviewObj.replies = reviewObj.replies.map(reply => {
        reply.canEdit = reply.user._id.toString() === req.user.id;
        reply.canDelete = reply.user._id.toString() === req.user.id || req.user.role === 'admin';
        
        // Add canEdit flag to nested replies
        if (reply.nestedReplies && reply.nestedReplies.length > 0) {
          reply.nestedReplies = reply.nestedReplies.map(nestedReply => {
            nestedReply.canEdit = nestedReply.user._id.toString() === req.user.id;
            nestedReply.canDelete = nestedReply.user._id.toString() === req.user.id || req.user.role === 'admin';
            return nestedReply;
          });
        }
        
        return reply;
      });
    }

    res.status(200).json({
      success: true,
      data: reviewObj
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update a reply
// @route   PUT /api/reviews/:id/reply/:replyId
// @access  Private
exports.updateReply = async (req, res) => {
  try {
    const { id, replyId } = req.params;
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

    // Find reply
    const reply = review.replies.id(replyId);

    // Check if reply exists
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: `Reply not found with id of ${replyId}`
      });
    }

    // Make sure user is the reply owner - ADMINS CANNOT EDIT OTHERS' REPLIES
    if (reply.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this reply. Users can only edit their own replies.'
      });
    }

    // Update reply
    reply.comment = comment;

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
      })
      .populate({
        path: 'replies.nestedReplies.user',
        select: 'name avatar'
      });

    // Add canEdit flag
    const reviewObj = review.toObject();
    reviewObj.canEdit = review.user._id.toString() === req.user.id;
    reviewObj.canDelete = review.user._id.toString() === req.user.id || req.user.role === 'admin';
    
    // Add canEdit flag to replies
    if (reviewObj.replies && reviewObj.replies.length > 0) {
      reviewObj.replies = reviewObj.replies.map(reply => {
        reply.canEdit = reply.user._id.toString() === req.user.id;
        reply.canDelete = reply.user._id.toString() === req.user.id || req.user.role === 'admin';
        
        // Add canEdit flag to nested replies
        if (reply.nestedReplies && reply.nestedReplies.length > 0) {
          reply.nestedReplies = reply.nestedReplies.map(nestedReply => {
            nestedReply.canEdit = nestedReply.user._id.toString() === req.user.id;
            nestedReply.canDelete = nestedReply.user._id.toString() === req.user.id || req.user.role === 'admin';
            return nestedReply;
          });
        }
        
        return reply;
      });
    }

    res.status(200).json({
      success: true,
      data: reviewObj
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update a nested reply
// @route   PUT /api/reviews/:id/reply/:replyId/nested/:nestedReplyId
// @access  Private
exports.updateNestedReply = async (req, res) => {
  try {
    const { id, replyId, nestedReplyId } = req.params;
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

    // Find parent reply
    const parentReply = review.replies.id(replyId);

    // Check if parent reply exists
    if (!parentReply) {
      return res.status(404).json({
        success: false,
        message: `Reply not found with id of ${replyId}`
      });
    }

    // Find nested reply
    const nestedReply = parentReply.nestedReplies.id(nestedReplyId);

    // Check if nested reply exists
    if (!nestedReply) {
      return res.status(404).json({
        success: false,
        message: `Nested reply not found with id of ${nestedReplyId}`
      });
    }

    // Make sure user is the nested reply owner - ADMINS CANNOT EDIT OTHERS' REPLIES
    if (nestedReply.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this reply. Users can only edit their own replies.'
      });
    }

    // Update nested reply
    nestedReply.comment = comment;

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
      })
      .populate({
        path: 'replies.nestedReplies.user',
        select: 'name avatar'
      });

    // Add canEdit flag
    const reviewObj = review.toObject();
    reviewObj.canEdit = review.user._id.toString() === req.user.id;
    reviewObj.canDelete = review.user._id.toString() === req.user.id || req.user.role === 'admin';
    
    // Add canEdit flag to replies
    if (reviewObj.replies && reviewObj.replies.length > 0) {
      reviewObj.replies = reviewObj.replies.map(reply => {
        reply.canEdit = reply.user._id.toString() === req.user.id;
        reply.canDelete = reply.user._id.toString() === req.user.id || req.user.role === 'admin';
        
        // Add canEdit flag to nested replies
        if (reply.nestedReplies && reply.nestedReplies.length > 0) {
          reply.nestedReplies = reply.nestedReplies.map(nestedReply => {
            nestedReply.canEdit = nestedReply.user._id.toString() === req.user.id;
            nestedReply.canDelete = nestedReply.user._id.toString() === req.user.id || req.user.role === 'admin';
            return nestedReply;
          });
        }
        
        return reply;
      });
    }

    res.status(200).json({
      success: true,
      data: reviewObj
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
    reply.deleteOne();

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
      })
      .populate({
        path: 'replies.nestedReplies.user',
        select: 'name avatar'
      });

    // Add canEdit flag
    const reviewObj = review.toObject();
    reviewObj.canEdit = review.user._id.toString() === req.user.id;
    reviewObj.canDelete = review.user._id.toString() === req.user.id || req.user.role === 'admin';
    
    // Add canEdit flag to replies
    if (reviewObj.replies && reviewObj.replies.length > 0) {
      reviewObj.replies = reviewObj.replies.map(reply => {
        reply.canEdit = reply.user._id.toString() === req.user.id;
        reply.canDelete = reply.user._id.toString() === req.user.id || req.user.role === 'admin';
        
        // Add canEdit flag to nested replies
        if (reply.nestedReplies && reply.nestedReplies.length > 0) {
          reply.nestedReplies = reply.nestedReplies.map(nestedReply => {
            nestedReply.canEdit = nestedReply.user._id.toString() === req.user.id;
            nestedReply.canDelete = nestedReply.user._id.toString() === req.user.id || req.user.role === 'admin';
            return nestedReply;
          });
        }
        
        return reply;
      });
    }

    res.status(200).json({
      success: true,
      data: reviewObj
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Delete a nested reply
// @route   DELETE /api/reviews/:id/reply/:replyId/nested/:nestedReplyId
// @access  Private
exports.deleteNestedReply = async (req, res) => {
  try {
    const { id, replyId, nestedReplyId } = req.params;

    // Find review
    let review = await Review.findById(id);

    // Check if review exists
    if (!review) {
      return res.status(404).json({
        success: false,
        message: `Review not found with id of ${id}`
      });
    }

    // Find parent reply
    const parentReply = review.replies.id(replyId);

    // Check if parent reply exists
    if (!parentReply) {
      return res.status(404).json({
        success: false,
        message: `Reply not found with id of ${replyId}`
      });
    }

    // Find nested reply
    const nestedReply = parentReply.nestedReplies.id(nestedReplyId);

    // Check if nested reply exists
    if (!nestedReply) {
      return res.status(404).json({
        success: false,
        message: `Nested reply not found with id of ${nestedReplyId}`
      });
    }

    // Make sure user is the nested reply owner or an admin
    if (nestedReply.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this nested reply'
      });
    }

    // Remove nested reply
    nestedReply.deleteOne();

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
      })
      .populate({
        path: 'replies.nestedReplies.user',
        select: 'name avatar'
      });

    // Add canEdit flag
    const reviewObj = review.toObject();
    reviewObj.canEdit = review.user._id.toString() === req.user.id;
    reviewObj.canDelete = review.user._id.toString() === req.user.id || req.user.role === 'admin';
    
    // Add canEdit flag to replies
    if (reviewObj.replies && reviewObj.replies.length > 0) {
      reviewObj.replies = reviewObj.replies.map(reply => {
        reply.canEdit = reply.user._id.toString() === req.user.id;
        reply.canDelete = reply.user._id.toString() === req.user.id || req.user.role === 'admin';
        
        // Add canEdit flag to nested replies
        if (reply.nestedReplies && reply.nestedReplies.length > 0) {
          reply.nestedReplies = reply.nestedReplies.map(nestedReply => {
            nestedReply.canEdit = nestedReply.user._id.toString() === req.user.id;
            nestedReply.canDelete = nestedReply.user._id.toString() === req.user.id || req.user.role === 'admin';
            return nestedReply;
          });
        }
        
        return reply;
      });
    }

    res.status(200).json({
      success: true,
      data: reviewObj
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