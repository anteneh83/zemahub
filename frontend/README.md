# ZemaHub — Frontend

This is the Next.js frontend for ZemaHub, the Ethiopian music discovery platform.

## 🚀 Features
- **Responsive Navigation**: Access Trending, New, and Fastest Growing sections.
- **Dynamic Search**: Instantly find music by artist or title.
- **User Library**: Interactive heart and clock icons for Favorites and Watch Later (authenticated only).
- **Embedded Playback**: Modal-based YouTube player using official iframes.
- **Client-Side State**: Fast filtering and JWT-based authentication flow.

## 🛠 Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: TailwindCSS
- **State Management**: React Hooks (State, Effect, Callback)
- **Icons**: Custom SVG icons for a consistent theme

## 🚦 Getting Started
1. Install dependencies: `npm install`
2. Set environment variables (optional): `NEXT_PUBLIC_API_BASE=http://localhost:5000`
3. Run dev server: `npm run dev`
4. Build for production: `npm run build`

## 🎨 UI/UX Design
- **Dark Mode**: Sleek slate-based dark theme.
- **Glassmorphism**: Sticky header with backdrop-blur.
- **Mobile Friendly**: Touch-optimized grid and interactive elements.
