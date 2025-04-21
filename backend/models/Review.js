const mongoose = require('mongoose');

// Create a nested reply schema that doesn't reference itself
const NestedReplySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create the main reply schema with nested replies
const ReplySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  nestedReplies: [NestedReplySchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Please add a comment'],
    trim: true
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  replies: [ReplySchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent user from submitting more than one review per game
ReviewSchema.index({ user: 1, game: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);