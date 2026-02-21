import axios from "axios";
import { Video } from "../models/Video";
import { YOUTUBE_API_KEY, YOUTUBE_REGION_CODE } from "../config/env";
import { calculateTrendingScore, calculateGrowthScore } from "../utils/ranking";

if (!YOUTUBE_API_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    "[YouTube] YOUTUBE_API_KEY is not set. YouTube fetching will be disabled."
  );
}

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

const ETHIOPIAN_KEYWORDS = [
  "Ethiopian music",
  "Ethiopia new music",
  "Eritrean music",
  "Amharic music",
  "Oromo music",
  "Tigrigna music"
];

// Only store videos that match Ethiopian music (title or channel)
const ETHIOPIAN_MATCH =
  /ethiopian|ethiopia|amharic|oromo|oromoo|tigrigna|tigrinya|eritrean|eritrea|addis|habesha|gurage|የኢትዮጵያ|አማርኛ|ኦሮሚያ|ትግርኛ/i;

function isEthiopian(title: string, channelName: string): boolean {
  return ETHIOPIAN_MATCH.test(title) || ETHIOPIAN_MATCH.test(channelName);
}

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: { high?: { url: string }; medium?: { url: string }; default?: { url: string } };
  };
}

interface YouTubeVideoStatsItem {
  id: string;
  statistics: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
}

export async function fetchAndUpdateVideos() {
  if (!YOUTUBE_API_KEY) return;

  const allVideoIds = new Set<string>();
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  for (const query of ETHIOPIAN_KEYWORDS) {
    const searchRes = await axios.get(`${YOUTUBE_API_BASE}/search`, {
      params: {
        part: "snippet",
        q: query,
        type: "video",
        videoCategoryId: "10", // Music category
        regionCode: YOUTUBE_REGION_CODE,
        maxResults: 25,
        publishedAfter: sevenDaysAgo.toISOString(),
        key: YOUTUBE_API_KEY
      }
    });

    const items: YouTubeSearchItem[] = searchRes.data.items || [];
    items.forEach((item) => {
      if (item.id?.videoId) allVideoIds.add(item.id.videoId);
    });
  }

  const ids = Array.from(allVideoIds);
  if (ids.length === 0) return;

  // Fetch statistics in batches of 50 (API limit)
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const statsRes = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
      params: {
        part: "snippet,statistics",
        id: batch.join(","),
        key: YOUTUBE_API_KEY
      }
    });

    const items: (YouTubeSearchItem & YouTubeVideoStatsItem)[] =
      statsRes.data.items || [];

    for (const item of items) {
      const videoId = (item as any).id?.videoId || (item as any).id;
      if (!videoId) continue;

      const snippet = (item as any).snippet;
      const title = snippet?.title || "";
      const channelName = snippet?.channelTitle || "";
      if (!isEthiopian(title, channelName)) continue;

      const stats = (item as any).statistics || {};

      const views = parseInt(stats.viewCount || "0", 10);
      const likes = parseInt(stats.likeCount || "0", 10);
      const comments = parseInt(stats.commentCount || "0", 10);

      const existing = await Video.findOne({ videoId });
      const previousViews = existing?.views || 0;

      const publishedAt = new Date(snippet.publishedAt);

      const trendingScore = calculateTrendingScore({
        ...(existing?.toObject() || {}),
        videoId,
        title: snippet.title,
        channelName: snippet.channelTitle,
        views,
        likes,
        comments,
        thumbnail:
          snippet.thumbnails?.high?.url ||
          snippet.thumbnails?.medium?.url ||
          snippet.thumbnails?.default?.url ||
          "",
        publishedAt
      } as any);

      const growthScore = calculateGrowthScore(
        views,
        previousViews,
        likes,
        comments
      );

      await Video.findOneAndUpdate(
        { videoId },
        {
          videoId,
          title: snippet.title,
          channelName: snippet.channelTitle,
          views,
          likes,
          comments,
          thumbnail:
            snippet.thumbnails?.high?.url ||
            snippet.thumbnails?.medium?.url ||
            snippet.thumbnails?.default?.url ||
            "",
          publishedAt,
          trendingScore,
          growthScore,
          lastStatsAt: new Date()
        },
        { upsert: true, new: true }
      );
    }
  }
}

