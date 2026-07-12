import Anime from "@/models/Anime";
import { slugify } from "./slugify";

export async function upsertAnimeList(items) {
  let created = 0;
  let updated = 0;
  let merged = 0;

  for (const item of items) {
    let existing = await Anime.findOne({ anilistId: item.anilistId });

    if (!existing) {
      // AniList occasionally lists the same anime under a second media id
      // (e.g. a re-listed or alternate entry). Match by title too before
      // creating a new card, so the same anime doesn't show up twice.
      existing = await Anime.findOne({
        anilistId: { $ne: null },
        $or: [
          { titleEnglish: item.titleEnglish },
          { titleOriginal: item.titleOriginal }
        ]
      });
      if (existing) merged++;
    }

    if (existing) {
      existing.anilistId = item.anilistId;
      existing.titleOriginal = item.titleOriginal;
      existing.titleEnglish = item.titleEnglish;
      existing.image = item.image;
      existing.type = item.type;
      existing.genres = item.genres;
      existing.description = item.description;
      existing.status = item.status;
      existing.totalEpisodes = item.totalEpisodes;

      if (item.nextEpisodeNumber != null) existing.nextEpisodeNumber = item.nextEpisodeNumber;
      if (item.nextEpisodeAt) existing.nextEpisodeAt = item.nextEpisodeAt;
      if (item.releaseYear) existing.releaseYear = item.releaseYear;
      if (item.releaseMonth) existing.releaseMonth = item.releaseMonth;

      // Fill in the original start date only if it isn't set yet — never
      // clobber a date an admin corrected by hand.
      if (!existing.firstEpisodeAt && item.firstEpisodeAt) {
        existing.firstEpisodeAt = item.firstEpisodeAt;
      }

      // Never overwrite a watch link the admin already set by hand.
      if (!existing.streamUrl && item.streamUrl) existing.streamUrl = item.streamUrl;
      if (!existing.streamPlatform && item.streamPlatform) {
        existing.streamPlatform = item.streamPlatform;
      }

      await existing.save();
      updated++;
    } else {
      const baseSlug = slugify(item.titleEnglish || item.titleOriginal);
      let slug = baseSlug;
      let counter = 1;
      while (await Anime.exists({ slug })) {
        slug = `${baseSlug}-${counter++}`;
      }

      await Anime.create({ ...item, slug });
      created++;
    }
  }

  return { created, updated, merged, total: items.length };
}
