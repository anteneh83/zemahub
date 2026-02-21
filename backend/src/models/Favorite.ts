import mongoose, { Schema, Document } from "mongoose";

export interface IFavorite extends Document {
  userId: mongoose.Types.ObjectId;
  videoId: string;
  createdAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    videoId: { type: String, required: true, index: true },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Favorite =
  mongoose.models.Favorite || mongoose.model<IFavorite>("Favorite", FavoriteSchema);

