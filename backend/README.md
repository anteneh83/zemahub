# ZemaHub — Backend

This is the Node.js/Express backend for ZemaHub, handling music aggregation, ranking, and user management.

## ⚙️ Core Services
- **YouTube Aggregator**: Fetches Ethiopian music metadata using YouTube Data API v3.
- **Ranking Engine**: Calculates trending and growth scores based on engagement metrics.
- **Cron Scheduler**: Daily automated updates for music data.
- **Auth Provider**: JWT-based authentication with bcrypt password hashing.

## 🛠 Tech Stack
- **Runtime**: Node.js + Express
- **Database**: MongoDB (Mongoose)
- **Security**: JWT + bcrypt
- **Scheduling**: Node-Cron

## 🚦 Getting Started
1. Install dependencies: `npm install`
2. Configure `.env`:
   - `MONGODB_URI`
   - `YOUTUBE_API_KEY`
   - `JWT_SECRET`
   - `YOUTUBE_REGION_CODE=ET`
3. Run dev server: `npm run dev`
4. Compile source: `npm run build`

## 📊 API Endpoints
- `GET /api/videos/trending`
- `GET /api/videos/new`
- `GET /api/videos/fastest`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/user/favorites`
