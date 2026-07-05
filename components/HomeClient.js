"use client";

import { useEffect, useMemo, useState } from "react";
import Tabs from "./Tabs";
import SearchBar from "./SearchBar";
import AnimeCard from "./AnimeCard";

export default function HomeClient() {
  const [tab, setTab] = useState("schedule");
  const [query, setQuery] = useState("");
  const [anime, setAnime] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    const params = new URLSearchParams({ tab });
    if (query.trim()) params.set("q", query.trim());

    fetch(`/api/anime?${params.toString()}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => setAnime(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [tab, query]);

  const empty = !loading && anime.length === 0;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-8 flex flex-col gap-1">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
          ON AIR TRACKER
        </p>
        <h1 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
          AnimeAiring
        </h1>
        <p className="max-w-xl text-sm text-muted">
          Live episode countdowns and upcoming premieres, sorted by what airs next.
        </p>
      </header>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs active={tab} onChange={setTab} />
        <SearchBar value={query} onChange={setQuery} />
      </div>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-card border border-line bg-surface"
            />
          ))}
        </div>
      )}

      {empty && (
        <div className="rounded-card border border-dashed border-line bg-surface/50 p-10 text-center text-muted">
          {query
            ? `No anime match "${query}".`
            : tab === "schedule"
            ? "No airing anime yet. Check back soon."
            : "No upcoming anime announced yet."}
        </div>
      )}

      {!loading && !empty && (
        <div className="grid gap-4 sm:grid-cols-2">
          {anime.map((item) => (
            <AnimeCard key={item._id} anime={item} />
          ))}
        </div>
      )}
    </main>
  );
}
