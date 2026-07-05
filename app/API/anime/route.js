import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Anime from "@/models/Anime";
import { slugify } from "@/lib/slugify";
import { getSortTime } from "@/lib/episode";

export async function GET(request) {
  await connectDB();

  const { searchParams } = new URL(request.url);
  const tab = searchParams.get("tab"); // "schedule" | "upcoming"
  const q = searchParams.get("q")?.trim();

  const filter = {};

  if (tab === "schedule") filter.status = { $in: ["airing", "finished"] };
  if (tab === "upcoming") filter.status = "upcoming";

  if (q) {
    const regex = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ titleOriginal: regex }, { titleEnglish: regex }];
  }

  const anime = await Anime.find(filter).lean();

  // Always show whichever anime airs soonest first, regardless of
  // the order they were added to the database.
  anime.sort((a, b) => getSortTime(a) - getSortTime(b));

  return NextResponse.json(anime);
}

export async function POST(request) {
  await connectDB();
  const body = await request.json();

  if (!body.titleOriginal || !body.titleEnglish || !body.image) {
    return NextResponse.json(
      { error: "titleOriginal, titleEnglish and image are required." },
      { status: 400 }
    );
  }

  const baseSlug = slugify(body.titleEnglish || body.titleOriginal);
  let slug = baseSlug;
  let counter = 1;
  while (await Anime.exists({ slug })) {
    slug = `${baseSlug}-${counter++}`;
  }

  const anime = await Anime.create({ ...body, slug });
  return NextResponse.json(anime, { status: 201 });
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
