const express = require('express');
const {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  likeReview,
  addReply,
  deleteReply
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
router.post('/:id/reply', protect, addReply);
router.delete('/:id/reply/:replyId', protect, deleteReply);

module.exports = router;