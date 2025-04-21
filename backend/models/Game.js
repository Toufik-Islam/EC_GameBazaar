const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price must be positive']
  },
  discountPrice: {
    type: Number,
    default: 0
  },
  releaseDate: {
    type: Date,
    required: [true, 'Please add a release date']
  },
  genre: {
    type: [String],
    required: [true, 'Please add at least one genre'],
    enum: [
      'Action', 'Adventure', 'RPG', 'Strategy', 'Simulation', 
      'Sports', 'Racing', 'Puzzle', 'FPS', 'Fighting', 
      'Platformer', 'Survival', 'Horror', 'Stealth', 'Open World'
    ]
  },
  platform: {
    type: [String],
    required: [true, 'Please add at least one platform'],
    enum: ['PC', 'PlayStation', 'Xbox', 'Nintendo', 'Mobile']
  },
  developer: {
    type: String,
    required: [true, 'Please add a developer']
  },
  publisher: {
    type: String,
    required: [true, 'Please add a publisher']
  },
  rating: {
    type: String,
    enum: ['E', 'E10+', 'T', 'M', 'A'],
    required: [true, 'Please add an ESRB rating']
  },
  stock: {
    type: Number,
    required: [true, 'Please add stock quantity'],
    min: [0, 'Stock cannot be negative']
  },
  systemRequirements: {
    type: String,
    default: ''
  },
  installationTutorial: {
    type: String,
    default: ''
  },
  images: {
    type: [String],
    default: ['default.jpg']
  },
  featured: {
    type: Boolean,
    default: false
  },
  onSale: {
    type: Boolean,
    default: false
  },
  averageRating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  numReviews: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create slug from title
GameSchema.pre('save', function(next) {
  this.slug = this.title
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
  next();
});

module.exports = mongoose.model('Game', GameSchema);