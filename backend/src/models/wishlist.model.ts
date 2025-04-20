import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './user.model';
import { IGame } from './game.model';

export interface IWishlist extends Document {
  user: Schema.Types.ObjectId | IUser;
  games: (Schema.Types.ObjectId | IGame)[];
  createdAt: Date;
  updatedAt: Date;
}

const wishlistSchema = new Schema<IWishlist>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Wishlist must belong to a user'],
      unique: true,
    },
    games: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Game',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Wishlist = mongoose.model<IWishlist>('Wishlist', wishlistSchema);

export default Wishlist;