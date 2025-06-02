const express = require('express');
const {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogsByType,
  getFeaturedBlogs,
  likeBlog,
  addComment,
  updateComment,
  deleteComment,
  likeComment,
  addReply,
  updateReply,
  deleteReply,
  likeReply,
  searchBlogs
} = require('../controllers/blogs');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getBlogs);
router.get('/search', searchBlogs);
router.get('/featured', getFeaturedBlogs);
router.get('/category/:blogType', getBlogsByType);
router.get('/:id', getBlog);

// Protected routes
router.post('/', protect, authorize('admin'), createBlog);
router.put('/:id', protect, authorize('admin'), updateBlog);
router.delete('/:id', protect, authorize('admin'), deleteBlog);
router.put('/:id/like', protect, likeBlog);

// Comment routes
router.post('/:id/comment', protect, addComment);
router.put('/:id/comment/:commentId', protect, updateComment);
router.delete('/:id/comment/:commentId', protect, deleteComment);
router.put('/:id/comment/:commentId/like', protect, likeComment);

// Reply routes
router.post('/:id/comment/:commentId/reply', protect, addReply);
router.put('/:id/comment/:commentId/reply/:replyId', protect, updateReply);
router.delete('/:id/comment/:commentId/reply/:replyId', protect, deleteReply);
router.put('/:id/comment/:commentId/reply/:replyId/like', protect, likeReply);

module.exports = router;
