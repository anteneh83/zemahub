import { IVideo } from "../models/Video";

// Basic V1 ranking logic based on the spec
export function calculateTrendingScore(video: IVideo): number {
  const viewsWeight = 0.5;
  const likesWeight = 0.3;
  const commentsWeight = 0.2;

  const now = Date.now();
  const publishedAt = video.publishedAt.getTime();
  const ageInHours = (now - publishedAt) / (1000 * 60 * 60);

  // Recency boost: newer videos get higher boost, decaying over ~7 days
  const recencyBoost = Math.max(0, 1 - ageInHours / (24 * 7)) * 1000;

  return (
    video.views * viewsWeight +
    video.likes * likesWeight +
    video.comments * commentsWeight +
    recencyBoost
  );
}

// Growth score based on change in views over ~24h and engagement ratio
export function calculateGrowthScore(
  currentViews: number,
  previousViews: number,
  likes: number,
  comments: number
): number {
  const viewDelta = Math.max(0, currentViews - previousViews);
  const engagement = likes + comments;
  const engagementRatio =
    currentViews > 0 ? Math.min(1, engagement / currentViews) : 0;

  return viewDelta * 0.7 + engagement * 0.2 + engagementRatio * 1000;
}

