// Works out which episode airs next, given the first-episode datetime
// and the airing interval. This is what lets a countdown auto-restart
// for the next episode the moment the previous one hits zero, with
// no manual update from the admin.
//
// `nextEpisodeNumber` / `nextEpisodeAt` (both optional) let an admin
// manually correct the schedule once — e.g. an episode got delayed —
// without breaking future auto-continuation. When set, that date/number
// becomes the new anchor point, and every episode after it is still
// computed automatically from there using the normal interval.
export function getNextEpisode(anime, now = new Date()) {
  const { firstEpisodeAt, intervalDays = 7, totalEpisodes, nextEpisodeNumber, nextEpisodeAt } = anime;

  const anchorDate = nextEpisodeAt || firstEpisodeAt;
  if (!anchorDate) return null;

  const anchorEpisodeNumber = nextEpisodeNumber || 1;
  const anchor = new Date(anchorDate);
  const intervalMs = intervalDays * 24 * 60 * 60 * 1000;
  const nowMs = now.getTime();

  if (nowMs < anchor.getTime()) {
    return { episodeNumber: anchorEpisodeNumber, airAt: anchor, finished: false };
  }

  const elapsed = nowMs - anchor.getTime();
  const periodsPassed = Math.floor(elapsed / intervalMs) + 1;
  const episodeNumber = anchorEpisodeNumber + periodsPassed;
  const airAt = new Date(anchor.getTime() + periodsPassed * intervalMs);

  if (totalEpisodes && episodeNumber > totalEpisodes) {
    return { episodeNumber: totalEpisodes, airAt: null, finished: true };
  }

  return { episodeNumber, airAt, finished: false };
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

// The weekday an anime usually airs on (0 = Sunday ... 6 = Saturday),
// used to group the Schedule tab by day. Based on firstEpisodeAt since
// that's the stable, original weekly slot even if the schedule was
// corrected once via nextEpisodeAt.
export function getAirWeekday(anime) {
  if (!anime.firstEpisodeAt) return null;
  return new Date(anime.firstEpisodeAt).getDay();
}
