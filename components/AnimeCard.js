import Image from "next/image";
import Countdown from "./Countdown";

export default function AnimeCard({ anime }) {
  return (
    <div className="group flex overflow-hidden rounded-card border border-line bg-surface shadow-card transition-all hover:border-accent/50 hover:shadow-glow">
      <div className="relative w-28 shrink-0 sm:w-36">
        <Image
          src={anime.image}
          alt={`${anime.titleEnglish} poster`}
          fill
          sizes="144px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-surface/40" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 p-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-accent">
            <span>{anime.type}</span>
          </div>
          <h3 className="mt-1 truncate font-display text-lg leading-tight tracking-wide text-white sm:text-xl">
            {anime.titleEnglish}
          </h3>
          <p className="truncate text-sm text-muted">{anime.titleOriginal}</p>

          {anime.genres?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {anime.genres.slice(0, 3).map((g) => (
                <span
                  key={g}
                  className="rounded-full border border-line px-2 py-0.5 text-[11px] text-muted"
                >
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Countdown anime={anime} />

          {anime.streamUrl && (
            <a
              href={anime.streamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-accent/90"
            >
              Watch
              {anime.streamPlatform ? ` on ${anime.streamPlatform}` : ""}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
