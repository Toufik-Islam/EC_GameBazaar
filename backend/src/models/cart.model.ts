import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './user.model';
import { IGame } from './game.model';

interface CartItem {
  game: Schema.Types.ObjectId | IGame;
  quantity: number;
  price: number;
}

export interface ICart extends Document {
  user: Schema.Types.ObjectId | IUser;
  items: CartItem[];
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

const cartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Cart must belong to a user'],
      unique: true,
    },
    items: [
      {
        game: {
          type: Schema.Types.ObjectId,
          ref: 'Game',
          required: [true, 'Cart item must reference a game'],
        },
        quantity: {
          type: Number,
          required: [true, 'Cart item must have a quantity'],
          min: [1, 'Quantity cannot be less than 1'],
          default: 1,
        },
        price: {
          type: Number,
          required: [true, 'Cart item must have a price'],
        },
      },
    ],
    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate totalPrice
cartSchema.pre('save', function (next) {
  if (this.items.length > 0) {
    this.totalPrice = this.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  } else {
    this.totalPrice = 0;
  }
  next();
});

const Cart = mongoose.model<ICart>('Cart', cartSchema);

export default Cart;