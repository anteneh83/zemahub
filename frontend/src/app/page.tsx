"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type Video = {
  _id: string;
  videoId: string;
  title: string;
  channelName: string;
  thumbnail: string;
  views: number;
  likes: number;
  comments: number;
  publishedAt: string;
};

import { apiFetch } from "@/lib/api";

function formatCount(count: number) {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

export default function Home() {
  const [trending, setTrending] = useState<Video[]>([]);
  const [newReleases, setNewReleases] = useState<Video[]>([]);
  const [fastest, setFastest] = useState<Video[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"trending" | "new" | "popular">(
    "trending",
  );
  const [searchResults, setSearchResults] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [embedVideoId, setEmbedVideoId] = useState<string | null>(null);

  useEffect(() => {
    setToken(typeof window !== "undefined" ? localStorage.getItem("zemahub_token") : null);
  }, []);

  useEffect(() => {
    if (!token) {
      setFavoriteIds(new Set());
      return;
    }
    const tokenStr: string = token;
    async function loadIds() {
      try {
        const [fav] = await Promise.all([
          apiFetch<{ videoIds: string[] }>("/api/user/favorites/ids", {}, tokenStr),
        ]);
        setFavoriteIds(new Set(fav.videoIds));
      } catch {
        setFavoriteIds(new Set());
      }
    }
    loadIds();
  }, [token]);

  useEffect(() => {
    async function load() {
      try {
        const [t, n, f, filtered] = await Promise.all([
          apiFetch<Video[]>("/api/videos/trending"),
          apiFetch<Video[]>("/api/videos/new"),
          apiFetch<Video[]>("/api/videos/fastest"),
          apiFetch<Video[]>(`/api/videos/search?q=&filter=trending`),
        ]);
        setTrending(t);
        setNewReleases(n);
        setFastest(f);
        setSearchResults(filtered);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function runSearch(q: string, f: "trending" | "new" | "popular") {
    const results = await apiFetch<Video[]>(
      `/api/videos/search?q=${encodeURIComponent(q.trim())}&filter=${f}`,
    );
    setSearchResults(results);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    await runSearch(query, filter);
  }

  const toggleFavorite = useCallback(
    async (videoId: string) => {
      if (!token) return;
      const isFav = favoriteIds.has(videoId);
      try {
        if (isFav) {
          await apiFetch(`/api/user/favorites/${videoId}`, {
            method: "DELETE",
          }, token);
          setFavoriteIds((prev) => {
            const next = new Set(prev);
            next.delete(videoId);
            return next;
          });
        } else {
          await apiFetch(`/api/user/favorites/${videoId}`, {
            method: "POST",
          }, token);
          setFavoriteIds((prev) => new Set(prev).add(videoId));
        }
      } catch {
        // ignore
      }
    },
    [token, favoriteIds]
  );

  const sections = [
    { id: "trending", title: "Trending This Week", data: trending },
    { id: "new", title: "New Releases", data: newReleases },
    { id: "fastest", title: "Fastest Growing Songs", data: fastest },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:py-4">
          <Link
            href="/"
            className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
          >
            <span className="rounded-lg bg-emerald-500 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-950">
              ZemaHub
            </span>
            <span className="hidden text-sm text-slate-400 sm:inline">
              Ethiopian Music Discovery
            </span>
          </Link>
          <nav className="flex items-center gap-3 text-sm text-slate-300 min-w-0">
            <a href="#trending" className="hidden sm:inline hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded">
              Trending
            </a>
            <a href="#new" className="hidden sm:inline hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded">
              New
            </a>
            <a href="#fastest" className="hidden sm:inline hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded">
              Fastest Growing
            </a>
            {token ? (
              <Link
                href="/dashboard"
                className="shrink-0 rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px] flex items-center justify-center"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="shrink-0 text-slate-300 hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded min-h-[44px] flex items-center"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="shrink-0 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px] flex items-center justify-center"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <section className="relative mb-8 overflow-hidden rounded-2xl min-h-[280px]">
          <div
            className="absolute inset-0 z-0"
            aria-hidden
          >
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
              style={{
                backgroundImage: `url(${trending[0]?.thumbnail || "/images/hero-bg.png"})`,
                filter: trending[0]?.thumbnail ? "blur(8px)" : "none",
              }}
            />
            <div className="absolute inset-0 bg-slate-950/50" />
          </div>

          <div className="relative z-10 p-6 sm:p-8 md:p-10">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-slate-50 drop-shadow-sm">
              Discover Ethiopian music in one place.
            </h1>
            <p className="mt-3 max-w-xl text-sm text-slate-200 sm:text-base md:text-lg font-medium drop-shadow-sm">
              All the latest and trending Ethiopian music videos, ranked by real
              engagement and updated every day.
            </p>

            <form
              onSubmit={handleSearch}
              className="mt-8 flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/40 p-4 backdrop-blur-md sm:flex-row sm:items-center shadow-xl"
            >
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by artist or song title…"
                  className="w-full rounded-xl border border-slate-700/50 bg-slate-950/50 pl-10 pr-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 caret-emerald-400 outline-none ring-emerald-500/40 focus:ring-2"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-bold text-slate-950 shadow-sm hover:bg-emerald-400 transition-colors sm:w-auto"
              >
                Search
              </button>
            </form>
          </div>
        </section>

        {(query.trim() || searchResults.length > 0) && (
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-400">
              {query.trim()
                ? "Search Results"
                : `Browse: ${filter.charAt(0).toUpperCase() + filter.slice(1)}`}
            </h2>
            {searchResults.length > 0 ? (
              <VideoGrid
                videos={searchResults}
                token={token}
                favoriteIds={favoriteIds}
                onFavoriteToggle={toggleFavorite}
                onPlayEmbed={setEmbedVideoId}
              />
            ) : (
              <p className="text-sm text-slate-500">
                {query.trim()
                  ? `No results found for "${query}" with the "${filter}" filter.`
                  : `No videos for "${filter}" right now. Try another filter.`}
              </p>
            )}
          </div>
        )}

        {loading && (
          <p className="text-sm text-slate-400">Loading latest music…</p>
        )}

        {!loading &&
          sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="mb-8 scroll-mt-16"
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-50 sm:text-xl">
                  {section.title}
                </h2>
              </div>
              <VideoGrid
                videos={section.data}
                token={token}
                favoriteIds={favoriteIds}
                onFavoriteToggle={toggleFavorite}
                onPlayEmbed={setEmbedVideoId}
              />
            </section>
          ))}
      </main>

      {embedVideoId && (
        <EmbedModal
          videoId={embedVideoId}
          onClose={() => setEmbedVideoId(null)}
        />
      )}
    </div>
  );
}

function EmbedModal({
  videoId,
  onClose,
}: {
  videoId: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Video player"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-slate-800 p-2 text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Close"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div className="relative w-full max-w-4xl aspect-video">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full rounded-lg"
        />
      </div>
    </div>
  );
}

function VideoGrid({
  videos,
  token,
  favoriteIds,
  onFavoriteToggle,
  onPlayEmbed,
}: {
  videos: Video[];
  token: string | null;
  favoriteIds: Set<string>;
  onFavoriteToggle: (videoId: string) => void;
  onPlayEmbed: (videoId: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const initialLimit = 15;

  if (!videos.length) {
    return (
      <p className="text-sm text-slate-500">
        No videos available yet. Please check back soon.
      </p>
    );
  }

  const displayedVideos = isExpanded ? videos : videos.slice(0, initialLimit);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayedVideos.map((video) => (
          <VideoCard
            key={video.videoId}
            video={video}
            token={token}
            isFavorite={favoriteIds.has(video.videoId)}
            onFavoriteToggle={onFavoriteToggle}
            onPlayEmbed={onPlayEmbed}
          />
        ))}
      </div>
      {!isExpanded && videos.length > initialLimit && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setIsExpanded(true)}
            className="rounded-full bg-slate-800 px-6 py-2 text-sm font-semibold text-emerald-400 border border-emerald-500/30 hover:bg-slate-700 hover:border-emerald-500 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-lg shadow-emerald-500/10"
          >
            See More ({videos.length - initialLimit} more)
          </button>
        </div>
      )}
    </>
  );
}

function VideoCard({
  video,
  token,
  isFavorite,
  onFavoriteToggle,
  onPlayEmbed,
}: {
  video: Video;
  token: string | null;
  isFavorite: boolean;
  onFavoriteToggle: (videoId: string) => void;
  onPlayEmbed: (videoId: string) => void;
}) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 transition hover:border-emerald-500/70 hover:bg-slate-900">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onPlayEmbed(video.videoId)}
            className="min-h-[44px] min-w-[44px] rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-lg hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Play"
          >
            Play
          </button>
          <a
            href={`https://www.youtube.com/watch?v=${video.videoId}`}
            target="_blank"
            rel="noreferrer"
            className="min-h-[44px] rounded-full border border-slate-300 bg-slate-900/90 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-white"
          >
            Open on YouTube
          </a>
        </div>
      </div>
      <div className="flex flex-col gap-1 px-3 pb-3 pt-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold text-slate-50 flex-1 min-w-0">
            {video.title}
          </h3>
          {token && (
            <div className="flex shrink-0 gap-1" role="group" aria-label="Save options">
              <button
                type="button"
                onClick={() => onFavoriteToggle(video.videoId)}
                className="min-h-[44px] min-w-[44px] rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                title={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                {isFavorite ? (
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                )}
              </button>
            </div>
          )}
        </div>
        <p className="text-xs text-slate-400">{video.channelName}</p>
        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
          <span>{formatCount(video.views)} views</span>
          <span>
            {formatCount(video.likes)} likes •{" "}
            {formatCount(video.comments)} comments
          </span>
        </div>
      </div>
    </article>
  );
}
