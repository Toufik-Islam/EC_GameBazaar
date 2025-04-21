const express = require('express');
const {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  likeReview,
  addReply,
  addNestedReply,
  updateReply,
  updateNestedReply,
  deleteReply,
  deleteNestedReply
} = require('../controllers/reviews');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getReviews);

// Protected routes
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.put('/:id/like', protect, likeReview);

// Reply routes
router.post('/:id/reply', protect, addReply);
router.put('/:id/reply/:replyId', protect, updateReply);
router.delete('/:id/reply/:replyId', protect, deleteReply);

// Nested reply routes
router.post('/:id/reply/:replyId', protect, addNestedReply);
router.put('/:id/reply/:replyId/nested/:nestedReplyId', protect, updateNestedReply);
router.delete('/:id/reply/:replyId/nested/:nestedReplyId', protect, deleteNestedReply);

module.exports = router;