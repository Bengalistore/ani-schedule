// Thin client for AniList's free public GraphQL API. AniChart itself has no
// public API — it runs entirely on this one, so this is what actually
// powers the automatic sync.
const ANILIST_ENDPOINT = "https://graphql.anilist.co";

const AIRING_QUERY = `
query ($page: Int, $perPage: Int, $airingAtGreater: Int, $airingAtLesser: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { hasNextPage }
    airingSchedules(
      airingAt_greater: $airingAtGreater
      airingAt_lesser: $airingAtLesser
      sort: TIME
    ) {
      episode
      airingAt
      media {
        id
        format
        episodes
        genres
        description(asHtml: false)
        title { romaji english native }
        coverImage { extraLarge large }
        externalLinks { url site type }
        startDate { year month day }
        nextAiringEpisode { episode airingAt }
      }
    }
  }
}`;

const UPCOMING_QUERY = `
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(status: NOT_YET_RELEASED, type: ANIME, sort: POPULARITY_DESC) {
      id
      format
      episodes
      genres
      description(asHtml: false)
      title { romaji english native }
      coverImage { extraLarge large }
      externalLinks { url site type }
      startDate { year month }
    }
  }
}`;

async function callAniList(query, variables) {
  const res = await fetch(ANILIST_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables })
  });

  const json = await res.json();
  if (!res.ok || json.errors) {
    const message = json.errors?.map((e) => e.message).join("; ") || res.statusText;
    throw new Error(`AniList API error: ${message}`);
  }
  return json.data;
}

function mapFormat(format) {
  switch (format) {
    case "MOVIE":
      return "Movie";
    case "OVA":
      return "OVA";
    case "ONA":
      return "ONA";
    case "SPECIAL":
    case "MUSIC":
      return "Special";
    default:
      return "TV";
  }
}

function pickStreamLink(externalLinks) {
  return (externalLinks || []).find((link) => link.type === "STREAMING") || {};
}

function toDate(startDate) {
  if (!startDate?.year) return null;
  return new Date(Date.UTC(startDate.year, (startDate.month || 1) - 1, startDate.day || 1));
}

function normalizeAiringMedia(media, fallbackEpisode, fallbackAiringAt) {
  const stream = pickStreamLink(media.externalLinks);
  const nextEp = media.nextAiringEpisode;

  return {
    anilistId: media.id,
    // Romaji (romanized) is used as the "original title" since not
    // everyone can read the native Japanese/Korean/Chinese script.
    titleOriginal: media.title.romaji || media.title.native,
    titleEnglish: media.title.english || media.title.romaji,
    image: media.coverImage.extraLarge || media.coverImage.large,
    type: mapFormat(media.format),
    genres: media.genres || [],
    description: (media.description || "").replace(/<[^>]+>/g, ""),
    streamUrl: stream.url || "",
    streamPlatform: stream.site || "",
    status: "airing",
    totalEpisodes: media.episodes || null,
    firstEpisodeAt: toDate(media.startDate),
    nextEpisodeNumber: nextEp ? nextEp.episode : fallbackEpisode,
    nextEpisodeAt: nextEp
      ? new Date(nextEp.airingAt * 1000)
      : new Date(fallbackAiringAt * 1000)
  };
}

function normalizeUpcomingMedia(media) {
  const stream = pickStreamLink(media.externalLinks);

  return {
    anilistId: media.id,
    titleOriginal: media.title.romaji || media.title.native,
    titleEnglish: media.title.english || media.title.romaji,
    image: media.coverImage.extraLarge || media.coverImage.large,
    type: mapFormat(media.format),
    genres: media.genres || [],
    description: (media.description || "").replace(/<[^>]+>/g, ""),
    streamUrl: stream.url || "",
    streamPlatform: stream.site || "",
    status: "upcoming",
    totalEpisodes: media.episodes || null,
    releaseYear: media.startDate?.year || null,
    releaseMonth: media.startDate?.month || null
  };
}

// Every anime with an episode airing in the next `days` days.
export async function fetchAiringWindow({ days = 7 } = {}) {
  const now = Math.floor(Date.now() / 1000);
  const later = now + days * 24 * 60 * 60;
  const seen = new Set();
  const results = [];

  let page = 1;
  const perPage = 50;

  // Safety cap of 10 pages (500 entries) so a bad response can't loop forever.
  while (page <= 10) {
    const data = await callAniList(AIRING_QUERY, {
      page,
      perPage,
      airingAtGreater: now,
      airingAtLesser: later
    });

    const schedules = data.Page.airingSchedules;
    for (const schedule of schedules) {
      if (seen.has(schedule.media.id)) continue;
      seen.add(schedule.media.id);
      results.push(normalizeAiringMedia(schedule.media, schedule.episode, schedule.airingAt));
    }

    if (!data.Page.pageInfo.hasNextPage || schedules.length === 0) break;
    page++;
  }

  return results;
}

// Popular anime announced but not airing yet, for the Upcoming tab.
export async function fetchUpcoming({ limit = 30 } = {}) {
  const data = await callAniList(UPCOMING_QUERY, { page: 1, perPage: limit });
  return data.Page.media.map(normalizeUpcomingMedia);
}
