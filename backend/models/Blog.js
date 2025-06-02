const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Please add comment content'],
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  replies: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: [true, 'Please add reply content'],
      maxlength: [500, 'Reply cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    likes: [{
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }]
  }],
  likes: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a blog title'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a blog description'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  content: {
    type: String,
    required: [true, 'Please add blog content'],
    minlength: [100, 'Content must be at least 100 characters long']
  },  blogType: {
    type: String,
    required: [true, 'Please specify blog type'],
    enum: {
      values: ['Game News', 'Gaming Tips', 'Installation Troubleshooting', 'Game Reviews', 'Industry Updates', 'Hardware & Tech', 'Game Guides', 'Gaming Culture'],
      message: 'Please select a valid blog type'
    }
  },
  frontpageImage: {
    type: String,
    required: [true, 'Please add a frontpage image']
  },  images: {
    type: [String],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length <= 10;
      },
      message: 'Maximum 10 images allowed'
    }
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  tags: [{
    type: String,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  comments: [CommentSchema],
  featured: {
    type: Boolean,
    default: false
  },
  relatedGames: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Game'
  }],  readTime: {
    type: Number, // in minutes
    default: 5
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create blog slug from title
BlogSchema.pre('save', function(next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = this.title.toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }
  
  // Calculate estimated read time (200 words per minute)
  if (this.isModified('content') || this.isNew) {
    const words = this.content.split(' ').length;
    this.readTime = Math.ceil(words / 200);
  }
  
  next();
});

// Populate author and related data
BlogSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'author',
    select: 'name avatar email'
  }).populate({
    path: 'relatedGames',
    select: 'title images price'
  }).populate({
    path: 'comments.user',
    select: 'name avatar'
  }).populate({
    path: 'comments.replies.user',
    select: 'name avatar'
  });
  
  next();
});

// Static method to get blogs by category
BlogSchema.statics.getBlogsByType = function(blogType) {
  return this.find({ 
    blogType: new RegExp(blogType, 'i'),
    status: 'published' 
  }).sort({ createdAt: -1 });
};

// Instance method to increment views
BlogSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

module.exports = mongoose.model('Blog', BlogSchema);
