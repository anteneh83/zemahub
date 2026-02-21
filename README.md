# ZemaHub — Ethiopian Music Discovery Platform

ZemaHub is a web-based Ethiopian music discovery platform that aggregates, ranks, and organizes the most recent and trending Ethiopian music videos from YouTube into one centralized website.

## 🚀 Features

-   🔥 **Trending This Week**: Ranked using views, likes, comments, and recency.
-   🆕 **New Releases**: Music uploaded within the last 7 days.
-   📈 **Fastest Growing**: Highlighting tracks with rapid engagement growth.
-   👤 **User Accounts**: Secure login/registration to save favorites and watch later.
-   ❤️ **Favorites System**: Save and manage your favorite Ethiopian tracks.
-   📱 **Fully Responsive**: Optimized for mobile, tablet, and desktop.
-   ▶ **Embedded Playback**: Watch directly via official YouTube iframe embeds.
-   🔎 **Search & Filter**: Find music by artist, song title, or popularity.

## 🏗 Technical Architecture

### Frontend
-   **Next.js 16** (App Router)
-   **TailwindCSS** for styling
-   **Responsive Design**

### Backend
-   **Node.js + Express**
-   **YouTube Data API v3** integration
-   **MongoDB** for data persistence
-   **JWT** based authentication
-   **Node-Cron** for daily trending updates

## 🛠 Setup & Installation

### Prerequisites
-   Node.js (v18+)
-   MongoDB (local or Atlas)
-   YouTube Data API Key

### Backend Setup
1.  Navigate to `backend/`
2.  Install dependencies: `npm install`
3.  Configure `.env` with your `MONGODB_URI`, `YOUTUBE_API_KEY`, and `JWT_SECRET`.
4.  Run development server: `npm run dev`

### Frontend Setup
1.  Navigate to `frontend/`
2.  Install dependencies: `npm install`
3.  Configure `.env.local` if needed (default `NEXT_PUBLIC_API_BASE=http://localhost:5000`).
4.  Run development server: `npm run dev`

## 🔒 Legal & Compliance
ZemaHub uses the official YouTube Data API and embeds videos using the official YouTube iframe player. No content is downloaded or redistributed, ensuring full compliance with YouTube's Terms of Service.
