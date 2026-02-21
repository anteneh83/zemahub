import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cron from "node-cron";
import { PORT, MONGODB_URI } from "./config/env";
import videoRoutes from "./routes/videoRoutes";
import authRoutes from "./routes/authRoutes";
import userLibraryRoutes from "./routes/userLibraryRoutes";
import { fetchAndUpdateVideos } from "./services/youtubeService";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "ZemaHub API" });
});

app.use("/api/videos", videoRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userLibraryRoutes);

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    // eslint-disable-next-line no-console
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`ZemaHub backend listening on port ${PORT}`);
    });

    // Initial fetch on startup
    fetchAndUpdateVideos().catch((err) =>
      // eslint-disable-next-line no-console
      console.error("Initial YouTube sync failed", err)
    );

    // Schedule cron job to update every day at 02:00
    cron.schedule("0 2 * * *", () => {
      // eslint-disable-next-line no-console
      console.log("Running daily YouTube sync...");
      fetchAndUpdateVideos().catch((err) =>
        // eslint-disable-next-line no-console
        console.error("Daily YouTube sync failed", err)
      );
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to start backend", err);
    process.exit(1);
  }
}

start();

