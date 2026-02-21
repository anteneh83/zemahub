import { Router } from "express";
import { Favorite } from "../models/Favorite";
import { WatchLater } from "../models/WatchLater";
import { authRequired, AuthRequest } from "../middleware/authMiddleware";
import { Video } from "../models/Video";

const router = Router();

// Favorites
router.post(
  "/favorites/:videoId",
  authRequired,
  async (req: AuthRequest, res) => {
    try {
      const { videoId } = req.params;
      await Favorite.findOneAndUpdate(
        { userId: req.userId, videoId },
        { userId: req.userId, videoId },
        { upsert: true }
      );
      return res.status(204).send();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      return res.status(500).json({ message: "Failed to favorite video" });
    }
  }
);

router.delete(
  "/favorites/:videoId",
  authRequired,
  async (req: AuthRequest, res) => {
    try {
      const { videoId } = req.params;
      await Favorite.deleteOne({ userId: req.userId, videoId });
      return res.status(204).send();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      return res.status(500).json({ message: "Failed to remove favorite" });
    }
  }
);

router.get("/favorites", authRequired, async (req: AuthRequest, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.userId }).lean();
    const videoIds = favorites.map((f) => f.videoId);
    const videos = await Video.find({ videoId: { $in: videoIds } }).lean();
    return res.json(videos);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch favorites" });
  }
});

router.get("/favorites/ids", authRequired, async (req: AuthRequest, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.userId })
      .select("videoId")
      .lean();
    return res.json({ videoIds: favorites.map((f) => f.videoId) });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch favorite ids" });
  }
});

// Watch later
router.post(
  "/watch-later/:videoId",
  authRequired,
  async (req: AuthRequest, res) => {
    try {
      const { videoId } = req.params;
      await WatchLater.findOneAndUpdate(
        { userId: req.userId, videoId },
        { userId: req.userId, videoId },
        { upsert: true }
      );
      return res.status(204).send();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      return res.status(500).json({ message: "Failed to add to Watch Later" });
    }
  }
);

router.delete(
  "/watch-later/:videoId",
  authRequired,
  async (req: AuthRequest, res) => {
    try {
      const { videoId } = req.params;
      await WatchLater.deleteOne({ userId: req.userId, videoId });
      return res.status(204).send();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      return res.status(500).json({ message: "Failed to remove from Watch Later" });
    }
  }
);

router.get("/watch-later", authRequired, async (req: AuthRequest, res) => {
  try {
    const list = await WatchLater.find({ userId: req.userId }).lean();
    const videoIds = list.map((i) => i.videoId);
    const videos = await Video.find({ videoId: { $in: videoIds } }).lean();
    return res.json(videos);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch Watch Later list" });
  }
});

router.get("/watch-later/ids", authRequired, async (req: AuthRequest, res) => {
  try {
    const list = await WatchLater.find({ userId: req.userId })
      .select("videoId")
      .lean();
    return res.json({ videoIds: list.map((i) => i.videoId) });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch watch-later ids" });
  }
});

export default router;

