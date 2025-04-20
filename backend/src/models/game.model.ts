import mongoose, { Document, Schema } from 'mongoose';

export interface IGame extends Document {
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  mainImage: string;
  categories: string[];
  tags: string[];
  platform: string[];
  releaseDate: Date;
  publisher: string;
  developer: string;
  rating: number;
  inStock: boolean;
  stockCount: number;
  featuredGame: boolean;
  viewCount: number;
  salesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const gameSchema = new Schema<IGame>(
  {
    title: {
      type: String,
      required: [true, 'Game title is required'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Game description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountPrice: {
      type: Number,
      default: null,
      min: [0, 'Discount price cannot be negative'],
    },
    images: {
      type: [String],
      default: [],
    },
    mainImage: {
      type: String,
      required: [true, 'Main image is required'],
    },
    categories: {
      type: [String],
      required: [true, 'At least one category is required'],
    },
    tags: {
      type: [String],
      default: [],
    },
    platform: {
      type: [String],
      required: [true, 'At least one platform is required'],
      enum: ['PC', 'PlayStation', 'Xbox', 'Nintendo', 'Mobile'],
    },
    releaseDate: {
      type: Date,
      default: Date.now,
    },
    publisher: {
      type: String,
      required: [true, 'Publisher is required'],
    },
    developer: {
      type: String,
      required: [true, 'Developer is required'],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5'],
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    stockCount: {
      type: Number,
      default: 100,
      min: [0, 'Stock count cannot be negative'],
    },
    featuredGame: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    salesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property for discounted percentage
gameSchema.virtual('discountPercentage').get(function (this: IGame) {
  if (this.discountPrice) {
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  return 0;
});

// Index for search functionality
gameSchema.index({ title: 'text', description: 'text', tags: 'text', categories: 'text' });

const Game = mongoose.model<IGame>('Game', gameSchema);

export default Game;