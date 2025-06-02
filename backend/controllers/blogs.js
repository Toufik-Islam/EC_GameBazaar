const Blog = require('../models/Blog');
const Game = require('../models/Game');

// @desc    Get all blogs with filters
// @route   GET /api/blogs
// @access  Public
exports.getBlogs = async (req, res) => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Only show published blogs for public access
    if (req.user?.role !== 'admin') {
      reqQuery.status = 'published';
    }

    // Special handling for blogType filter
    if (reqQuery.blogType) {
      reqQuery.blogType = new RegExp(reqQuery.blogType, 'i');
    }

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    let query = Blog.find(JSON.parse(queryStr));

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Blog.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const blogs = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: blogs.length,
      pagination,
      data: blogs
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get single blog
// @route   GET /api/blogs/:id
// @access  Public
exports.getBlog = async (req, res) => {
  try {
    let blog;

    // Check if it's a slug or ID
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      // It's an ObjectId
      blog = await Blog.findById(req.params.id);
    } else {
      // It's a slug
      blog = await Blog.findOne({ slug: req.params.id });
    }

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check if blog is published (unless user is admin)
    if (blog.status !== 'published' && req.user?.role !== 'admin') {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Increment views for published blogs
    if (blog.status === 'published') {
      await blog.incrementViews();
    }

    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Create new blog
// @route   POST /api/blogs
// @access  Private/Admin
exports.createBlog = async (req, res) => {
  try {    // Add author to req.body
    req.body.author = req.user.id;

    // Debug logging
    console.log('Blog creation request body:', JSON.stringify({
      ...req.body, 
      frontpageImage: req.body.frontpageImage ? 'DATA_URL (truncated)' : 'missing',
      images: Array.isArray(req.body.images) ? `Array with ${req.body.images.length} items` : 'not an array'
    }, null, 2));
    console.log('User ID:', req.user.id);

    // Validate related games if provided
    if (req.body.relatedGames && req.body.relatedGames.length > 0) {
      const games = await Game.find({ _id: { $in: req.body.relatedGames } });
      if (games.length !== req.body.relatedGames.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more related games not found'
        });
      }
    }

    const blog = await Blog.create(req.body);

    res.status(201).json({
      success: true,
      data: blog
    });
  } catch (err) {
    // Enhanced error logging
    console.error('Blog creation error:', err);
    if (err.errors) {
      console.error('Validation errors:', err.errors);
    }

    // Handle duplicate slug error
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Blog with similar title already exists'
      });
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private/Admin
exports.updateBlog = async (req, res) => {
  try {
    let blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }    // Make sure user is blog author or admin
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this blog'
      });
    }

    // Debug logging for update request
    console.log('Blog update request body:', JSON.stringify({
      ...req.body, 
      frontpageImage: req.body.frontpageImage ? 'DATA_URL (truncated)' : 'missing',
      images: Array.isArray(req.body.images) ? `Array with ${req.body.images.length} items` : 'not an array'
    }, null, 2));

    // Validate related games if provided
    if (req.body.relatedGames && req.body.relatedGames.length > 0) {
      const games = await Game.find({ _id: { $in: req.body.relatedGames } });
      if (games.length !== req.body.relatedGames.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more related games not found'
        });
      }
    }

    blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (err) {
    // Handle duplicate slug error
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Blog with similar title already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Make sure user is blog author or admin
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this blog'
      });
    }

    await blog.deleteOne();

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

// @desc    Get blogs by type/category
// @route   GET /api/blogs/category/:blogType
// @access  Public
exports.getBlogsByType = async (req, res) => {
  try {
    const blogType = req.params.blogType;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const blogs = await Blog.getBlogsByType(blogType)
      .skip(startIndex)
      .limit(limit);

    const total = await Blog.countDocuments({ 
      blogType: new RegExp(blogType, 'i'),
      status: 'published' 
    });

    res.status(200).json({
      success: true,
      count: blogs.length,
      total,
      data: blogs
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get featured blogs
// @route   GET /api/blogs/featured
// @access  Public
exports.getFeaturedBlogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;
    const blogs = await Blog.find({ 
      featured: true, 
      status: 'published' 
    }).limit(limit).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Like/Unlike blog
// @route   PUT /api/blogs/:id/like
// @access  Private
exports.likeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check if blog is already liked by user
    const likeIndex = blog.likes.indexOf(req.user.id);

    if (likeIndex > -1) {
      // Unlike the blog
      blog.likes.splice(likeIndex, 1);
    } else {
      // Like the blog
      blog.likes.push(req.user.id);
    }

    await blog.save();

    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Add comment to blog
// @route   POST /api/blogs/:id/comment
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide comment content'
      });
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    if (blog.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Cannot comment on unpublished blog'
      });
    }

    const comment = {
      user: req.user.id,
      content: content.trim(),
      replies: [],
      likes: []
    };

    blog.comments.push(comment);
    await blog.save();

    // Populate the new comment
    await blog.populate({
      path: 'comments.user',
      select: 'name avatar'
    });

    const newComment = blog.comments[blog.comments.length - 1];

    res.status(201).json({
      success: true,
      data: newComment
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update comment
// @route   PUT /api/blogs/:id/comment/:commentId
// @access  Private
exports.updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { id, commentId } = req.params;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide comment content'
      });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const comment = blog.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Make sure user is comment owner
    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this comment'
      });
    }

    comment.content = content.trim();
    await blog.save();

    res.status(200).json({
      success: true,
      data: comment
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Delete comment
// @route   DELETE /api/blogs/:id/comment/:commentId
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const comment = blog.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Make sure user is comment owner or admin
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    blog.comments.pull(commentId);
    await blog.save();

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

// @desc    Like/Unlike comment
// @route   PUT /api/blogs/:id/comment/:commentId/like
// @access  Private
exports.likeComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const comment = blog.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if comment is already liked by user
    const likeIndex = comment.likes.indexOf(req.user.id);

    if (likeIndex > -1) {
      // Unlike the comment
      comment.likes.splice(likeIndex, 1);
    } else {
      // Like the comment
      comment.likes.push(req.user.id);
    }

    await blog.save();

    res.status(200).json({
      success: true,
      data: comment
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Add reply to comment
// @route   POST /api/blogs/:id/comment/:commentId/reply
// @access  Private
exports.addReply = async (req, res) => {
  try {
    const { content } = req.body;
    const { id, commentId } = req.params;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide reply content'
      });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const comment = blog.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const reply = {
      user: req.user.id,
      content: content.trim(),
      likes: []
    };

    comment.replies.push(reply);
    await blog.save();

    // Populate the new reply
    await blog.populate({
      path: 'comments.replies.user',
      select: 'name avatar'
    });

    const newReply = comment.replies[comment.replies.length - 1];

    res.status(201).json({
      success: true,
      data: newReply
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update reply
// @route   PUT /api/blogs/:id/comment/:commentId/reply/:replyId
// @access  Private
exports.updateReply = async (req, res) => {
  try {
    const { content } = req.body;
    const { id, commentId, replyId } = req.params;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide reply content'
      });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const comment = blog.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const reply = comment.replies.id(replyId);

    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }

    // Make sure user is reply owner
    if (reply.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this reply'
      });
    }

    reply.content = content.trim();
    await blog.save();

    res.status(200).json({
      success: true,
      data: reply
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Delete reply
// @route   DELETE /api/blogs/:id/comment/:commentId/reply/:replyId
// @access  Private
exports.deleteReply = async (req, res) => {
  try {
    const { id, commentId, replyId } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const comment = blog.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const reply = comment.replies.id(replyId);

    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }

    // Make sure user is reply owner or admin
    if (reply.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this reply'
      });
    }

    comment.replies.pull(replyId);
    await blog.save();

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

// @desc    Like/Unlike reply
// @route   PUT /api/blogs/:id/comment/:commentId/reply/:replyId/like
// @access  Private
exports.likeReply = async (req, res) => {
  try {
    const { id, commentId, replyId } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const comment = blog.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const reply = comment.replies.id(replyId);

    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }

    // Check if reply is already liked by user
    const likeIndex = reply.likes.indexOf(req.user.id);

    if (likeIndex > -1) {
      // Unlike the reply
      reply.likes.splice(likeIndex, 1);
    } else {
      // Like the reply
      reply.likes.push(req.user.id);
    }

    await blog.save();

    res.status(200).json({
      success: true,
      data: reply
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Search blogs
// @route   GET /api/blogs/search
// @access  Public
exports.searchBlogs = async (req, res) => {
  try {
    const { q, blogType, page = 1, limit = 10 } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide search query'
      });
    }

    const query = {
      status: 'published',
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    };

    if (blogType) {
      query.blogType = new RegExp(blogType, 'i');
    }

    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const blogs = await Blog.find(query)
      .skip(startIndex)
      .limit(parseInt(limit))
      .sort('-createdAt');

    const total = await Blog.countDocuments(query);

    res.status(200).json({
      success: true,
      count: blogs.length,
      total,
      data: blogs
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
