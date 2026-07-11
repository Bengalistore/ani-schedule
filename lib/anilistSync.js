import Anime from "@/models/Anime";
import { slugify } from "./slugify";

export async function upsertAnimeList(items) {
  let created = 0;
  let updated = 0;

  for (const item of items) {
    const existing = await Anime.findOne({ anilistId: item.anilistId });

    if (existing) {
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

  return { created, updated, total: items.length };
}
