import mongoose, { Schema, Document } from "mongoose";

export interface IVideo extends Document {
  videoId: string;
  title: string;
  channelName: string;
  views: number;
  likes: number;
  comments: number;
  thumbnail: string;
  publishedAt: Date;
  trendingScore: number;
  growthScore: number;
  lastStatsAt?: Date;
}

const VideoSchema = new Schema<IVideo>(
  {
    videoId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    channelName: { type: String, required: true },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    thumbnail: { type: String, required: true },
    publishedAt: { type: Date, required: true },
    trendingScore: { type: Number, default: 0, index: true },
    growthScore: { type: Number, default: 0, index: true },
    lastStatsAt: { type: Date },
  },
  { timestamps: true }
);

export const Video =
  mongoose.models.Video || mongoose.model<IVideo>("Video", VideoSchema);

