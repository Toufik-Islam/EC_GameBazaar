const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      game: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity cannot be less than 1'],
        default: 1
      },
      price: {
        type: Number,
        required: true
      }
    }
  ],
  totalPrice: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate totalPrice before save
CartSchema.pre('save', function(next) {
  this.totalPrice = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  
  next();
});

module.exports = mongoose.model('Cart', CartSchema);