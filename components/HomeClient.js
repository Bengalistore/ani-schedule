"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Tabs from "./Tabs";
import WeekdayTabs from "./WeekdayTabs";
import SearchBar from "./SearchBar";
import AnimeCard from "./AnimeCard";
import { getAirWeekday } from "@/lib/episode";

export default function HomeClient() {
  const [tab, setTab] = useState("schedule");
  const [query, setQuery] = useState("");
  const [anime, setAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  // Defaults to today's weekday so the Schedule tab opens on "what's airing today".
  const [weekday, setWeekday] = useState(() => new Date().getDay());
  // Once the user manually picks a day, stop auto-advancing so we don't
  // yank them off the day they're browsing when midnight passes.
  const userPickedDay = useRef(false);

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

  // Keep "today" correct across local midnight without needing a page
  // refresh: schedule an update for the next midnight, then keep
  // rescheduling every 24h after that.
  useEffect(() => {
    let timeoutId;

    function scheduleNextMidnight() {
      const now = new Date();
      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        5 // a few seconds after midnight, to be safely past the boundary
      );
      const msUntilMidnight = nextMidnight.getTime() - now.getTime();

      timeoutId = setTimeout(() => {
        if (!userPickedDay.current) {
          setWeekday(new Date().getDay());
        }
        scheduleNextMidnight();
      }, msUntilMidnight);
    }

    scheduleNextMidnight();
    return () => clearTimeout(timeoutId);
  }, []);

  // Also catch the transition immediately if the tab was backgrounded
  // (mobile browsers throttle timers) and comes back into focus on a new day.
  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible" && !userPickedDay.current) {
        setWeekday(new Date().getDay());
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  function handleWeekdayChange(day) {
    userPickedDay.current = true;
    setWeekday(day);
  }

  const visibleAnime = useMemo(() => {
    if (tab !== "schedule" || weekday === "all") return anime;
    return anime.filter((item) => getAirWeekday(item) === weekday);
  }, [anime, tab, weekday]);

  const empty = !loading && visibleAnime.length === 0;
  const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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

      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs active={tab} onChange={setTab} />
        <SearchBar value={query} onChange={setQuery} />
      </div>

      {tab === "schedule" && (
        <div className="mb-6">
          <WeekdayTabs active={weekday} onChange={handleWeekdayChange} />
        </div>
      )}

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
            ? weekday === "all"
              ? "No airing anime yet. Check back soon."
              : `Nothing airs on ${DAY_NAMES[weekday]}.`
            : "No upcoming anime announced yet."}
        </div>
      )}

      {!loading && !empty && (
        <div className="grid gap-4 sm:grid-cols-2">
          {visibleAnime.map((item) => (
            <AnimeCard key={item._id} anime={item} />
          ))}
        </div>
      )}
    </main>
  );
}
