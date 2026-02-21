import { Router } from "express";
import { Video } from "../models/Video";

const router = Router();

// Exclude worship/gospel from all lists (no worship filter)
const NO_WORSHIP = {
  $and: [
    { title: { $not: /worship|gospel/i } },
    { channelName: { $not: /worship|gospel/i } },
  ],
};

// Only include Ethiopian music: title or channel must match at least one of these
const ETHIOPIAN_KEYWORDS =
  /ethiopian|ethiopia|amharic|oromo|oromoo|tigrigna|tigrinya|eritrean|eritrea|addis|habesha|gurage|somali\s*ethiopia|የኢትዮጵያ|አማርኛ|ኦሮሚያ|ትግርኛ/i;

const ETHIOPIAN_ONLY = {
  $or: [
    { title: { $regex: ETHIOPIAN_KEYWORDS } },
    { channelName: { $regex: ETHIOPIAN_KEYWORDS } },
  ],
};

// Combined: Ethiopian only + no worship
const LIST_CRITERIA = {
  $and: [NO_WORSHIP, ETHIOPIAN_ONLY],
};

// GET /api/videos/trending
router.get("/trending", async (req, res) => {
  try {
    const videos = await Video.find(LIST_CRITERIA)
      .sort({ trendingScore: -1 })
      .limit(50)
      .lean();
    res.json(videos);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ message: "Failed to fetch trending videos" });
  }
});

// GET /api/videos/new
router.get("/new", async (req, res) => {
  try {
    const sevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    );
    const videos = await Video.find({
      ...LIST_CRITERIA,
      publishedAt: { $gte: sevenDaysAgo },
    })
      .sort({ publishedAt: -1 })
      .limit(50)
      .lean();
    res.json(videos);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ message: "Failed to fetch new releases" });
  }
});

// GET /api/videos/fastest
router.get("/fastest", async (req, res) => {
  try {
    const videos = await Video.find(LIST_CRITERIA)
      .sort({ growthScore: -1 })
      .limit(50)
      .lean();
    res.json(videos);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ message: "Failed to fetch fastest growing songs" });
  }
});

// GET /api/videos/search?q=...&filter=trending|new|popular
router.get("/search", async (req, res) => {
  try {
    const q = (req.query.q as string) || "";
    const filter = (req.query.filter as string) || "trending";

    const criteria: Record<string, unknown> =
      q.trim() === ""
        ? LIST_CRITERIA
        : {
            $and: [
              LIST_CRITERIA,
              {
                $or: [
                  { title: { $regex: q.trim(), $options: "i" } },
                  { channelName: { $regex: q.trim(), $options: "i" } },
                ],
              },
            ],
          };

    let sort: Record<string, 1 | -1> = { trendingScore: -1 };
    if (filter === "new") {
      sort = { publishedAt: -1 };
    } else if (filter === "popular") {
      sort = { views: -1 };
    }

    const videos = await Video.find(criteria).sort(sort).limit(50).lean();
    res.json(videos);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ message: "Search failed" });
  }
});

export default router;

