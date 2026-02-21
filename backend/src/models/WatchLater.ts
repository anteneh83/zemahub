import mongoose, { Schema, Document } from "mongoose";

export interface IWatchLater extends Document {
  userId: mongoose.Types.ObjectId;
  videoId: string;
  addedAt: Date;
}

const WatchLaterSchema = new Schema<IWatchLater>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    videoId: { type: String, required: true, index: true },
    addedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const WatchLater =
  mongoose.models.WatchLater || mongoose.model<IWatchLater>("WatchLater", WatchLaterSchema);

