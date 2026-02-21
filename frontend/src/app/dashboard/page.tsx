"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

type Video = {
  _id: string;
  videoId: string;
  title: string;
  channelName: string;
  thumbnail: string;
  views: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [embedVideoId, setEmbedVideoId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("zemahub_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    const tokenStr: string = token;
    async function load() {
      try {
        const [fav] = await Promise.all([
          apiFetch<Video[]>("/api/user/favorites", {}, tokenStr),
        ]);
        setFavorites(fav);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("zemahub_token");
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="rounded-lg bg-emerald-500 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-950 hover:bg-emerald-400">
              ZemaHub
            </Link>
            <span className="text-sm text-slate-400">Your Library</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-slate-300 hover:text-emerald-400"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {loading ? (
          <p className="text-sm text-slate-400">Loading your library…</p>
        ) : (
          <>
            <section className="mb-8">
              <h2 className="mb-3 text-lg font-semibold text-slate-50">
                Favorites
              </h2>
              <LibraryGrid
                videos={favorites}
                emptyLabel="No favorites yet."
                onPlayEmbed={setEmbedVideoId}
              />
            </section>
          </>
        )}

        {embedVideoId && (
          <EmbedModal
            videoId={embedVideoId}
            onClose={() => setEmbedVideoId(null)}
          />
        )}
      </main>
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

function LibraryGrid({
  videos,
  emptyLabel,
  onPlayEmbed,
}: {
  videos: Video[];
  emptyLabel: string;
  onPlayEmbed: (videoId: string) => void;
}) {
  if (!videos.length) {
    return (
      <p className="text-sm text-slate-500">
        {emptyLabel} Go to the homepage to start saving songs.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {videos.map((video) => (
        <article
          key={video.videoId}
          className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 transition hover:border-emerald-500/70 hover:bg-slate-900"
        >
          <div className="relative aspect-video overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
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
                Play on YouTube
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-1 px-3 pb-3 pt-2">
            <h3 className="line-clamp-2 text-sm font-semibold text-slate-50">
              {video.title}
            </h3>
            <p className="text-xs text-slate-400">{video.channelName}</p>
            <p className="mt-1 text-[11px] text-slate-400">
              {video.views.toLocaleString()} views
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}

