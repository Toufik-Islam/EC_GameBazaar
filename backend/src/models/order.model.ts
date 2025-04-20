import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './user.model';
import { IGame } from './game.model';

interface OrderItem {
  game: Schema.Types.ObjectId | IGame;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  user: Schema.Types.ObjectId | IUser;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'credit_card' | 'paypal' | 'crypto';
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress?: {
    name: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  deliveryNotes?: string;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Order must belong to a user'],
    },
    items: [
      {
        game: {
          type: Schema.Types.ObjectId,
          ref: 'Game',
          required: [true, 'Order item must reference a game'],
        },
        quantity: {
          type: Number,
          required: [true, 'Order item must have a quantity'],
          min: [1, 'Quantity cannot be less than 1'],
        },
        price: {
          type: Number,
          required: [true, 'Order item must have a price'],
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: [true, 'Order must have a total amount'],
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'paypal', 'crypto'],
      required: [true, 'Payment method is required'],
    },
    status: {
      type: String,
      enum: ['processing', 'shipped', 'delivered', 'cancelled'],
      default: 'processing',
    },
    shippingAddress: {
      name: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      phone: String,
    },
    deliveryNotes: String,
    trackingNumber: String,
  },
  {
    timestamps: true,
  }
);

// Create a unique order number before saving
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    // Generate a unique order number (current timestamp + random string)
    const timestamp = new Date().getTime();
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.orderNumber = `ORD-${timestamp}-${randomStr}`;
  }
  next();
});

const Order = mongoose.model<IOrder>('Order', orderSchema);

export default Order;