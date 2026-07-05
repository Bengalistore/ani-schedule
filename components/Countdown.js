"use client";

import { useEffect, useState } from "react";
import { getNextEpisode } from "@/lib/episode";

function formatParts(ms) {
  if (ms <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  const totalSeconds = Math.floor(ms / 1000);
  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return { d, h, m, s };
}

function pad(n) {
  return String(n).padStart(2, "0");
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export default function Countdown({ anime }) {
  const [next, setNext] = useState(() => getNextEpisode(anime));
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const tick = setInterval(() => {
      const current = new Date();
      setNow(current.getTime());

      // The moment we cross an airing timestamp, recompute so the
      // countdown seamlessly rolls over to the following episode.
      setNext((prev) => {
        if (prev && prev.airAt && current.getTime() >= new Date(prev.airAt).getTime()) {
          return getNextEpisode(anime, current);
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(tick);
  }, [anime]);

  if (!anime.firstEpisodeAt) {
    const label = anime.releaseYear
      ? `${anime.releaseMonth ? MONTHS[anime.releaseMonth - 1] + " " : ""}${anime.releaseYear}`
      : "Date TBA";
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-surface2 px-3 py-1 text-xs font-medium text-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
        Coming {label}
      </div>
    );
  }

  if (!next || next.finished || !next.airAt) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-surface2 px-3 py-1 text-xs font-medium text-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-muted" />
        Finished airing
      </div>
    );
  }

  const remaining = new Date(next.airAt).getTime() - now;
  const { d, h, m, s } = formatParts(remaining);

  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center gap-1 rounded-full bg-onair/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-onair">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-onair" />
        EP {next.episodeNumber}
      </span>
      <div className="font-mono text-sm font-medium text-gold tabular-nums">
        {d > 0 && <span>{d}d </span>}
        {pad(h)}:{pad(m)}:{pad(s)}
      </div>
    </div>
  );
}
