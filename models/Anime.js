import mongoose from "mongoose";

const AnimeSchema = new mongoose.Schema(
  {
    titleOriginal: { type: String, required: true, trim: true },
    titleEnglish: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },

    image: { type: String, required: true },
    type: {
      type: String,
      enum: ["TV", "Movie", "OVA", "ONA", "Special"],
      default: "TV"
    },
    genres: { type: [String], default: [] },
    description: { type: String, default: "" },

    streamUrl: { type: String, default: "" },
    streamPlatform: { type: String, default: "" },

    // "airing" -> shows on the Schedule tab with a live countdown
    // "upcoming" -> shows on the Upcoming tab, release date may be partial
    // "finished" -> no more upcoming episodes
    status: {
      type: String,
      enum: ["airing", "upcoming", "finished"],
      default: "airing",
      index: true
    },

    // Exact datetime of episode 1. Required once known (airing anime).
    // Can be left null for upcoming titles whose exact date isn't announced yet.
    firstEpisodeAt: { type: Date, default: null },

    // Used for "Upcoming" cards when only a month/year is known,
    // e.g. announced for "October 2026" before an exact date exists.
    releaseYear: { type: Number, default: null },
    releaseMonth: { type: Number, default: null }, // 1-12

    intervalDays: { type: Number, default: 7 },
    totalEpisodes: { type: Number, default: null },

    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.models.Anime || mongoose.model("Anime", AnimeSchema);
