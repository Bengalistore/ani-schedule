// Works out which episode airs next, given the first-episode datetime
// and the airing interval. This is what lets a countdown auto-restart
// for the next episode the moment the previous one hits zero, with
// no manual update from the admin.
export function getNextEpisode(anime, now = new Date()) {
  const { firstEpisodeAt, intervalDays = 7, totalEpisodes } = anime;

  if (!firstEpisodeAt) return null;

  const first = new Date(firstEpisodeAt);
  const intervalMs = intervalDays * 24 * 60 * 60 * 1000;
  const nowMs = now.getTime();

  if (nowMs < first.getTime()) {
    return { episodeNumber: 1, airAt: first, finished: false };
  }

  const elapsed = nowMs - first.getTime();
  const periodsPassed = Math.floor(elapsed / intervalMs) + 1;
  const nextEpisodeNumber = periodsPassed + 1;
  const nextAirAt = new Date(first.getTime() + periodsPassed * intervalMs);

  if (totalEpisodes && nextEpisodeNumber > totalEpisodes) {
    return { episodeNumber: totalEpisodes, airAt: null, finished: true };
  }

  return { episodeNumber: nextEpisodeNumber, airAt: nextAirAt, finished: false };
}

// A single sortable timestamp used to order both tabs by "airs soonest first".
export function getSortTime(anime) {
  if (anime.status === "upcoming") {
    if (anime.firstEpisodeAt) return new Date(anime.firstEpisodeAt).getTime();
    if (anime.releaseYear) {
      const month = anime.releaseMonth ? anime.releaseMonth - 1 : 0;
      return new Date(anime.releaseYear, month, 1).getTime();
    }
    return Infinity;
  }

  const next = getNextEpisode(anime);
  return next && next.airAt ? next.airAt.getTime() : Infinity;
}
