import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || 5000;
export const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://antig:Anti7452@cluster0.2slssbc.mongodb.net/zemahub?retryWrites=true&w=majority&appName=Cluster0";

export const JWT_SECRET =
  process.env.JWT_SECRET || "change-this-secret-in-production";

export const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "";
export const YOUTUBE_REGION_CODE = process.env.YOUTUBE_REGION_CODE || "ET";

