import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Anime from "@/models/Anime";
import { slugify } from "@/lib/slugify";

export async function GET(_request, { params }) {
  await connectDB();
  const anime = await Anime.findById(params.id).lean();
  if (!anime) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(anime);
}

export async function PUT(request, { params }) {
  await connectDB();
  const body = await request.json();

  // Re-slug if the English title changed.
  if (body.titleEnglish) {
    const current = await Anime.findById(params.id).lean();
    if (current && slugify(body.titleEnglish) !== current.slug) {
      const baseSlug = slugify(body.titleEnglish);
      let slug = baseSlug;
      let counter = 1;
      while (await Anime.exists({ slug, _id: { $ne: params.id } })) {
        slug = `${baseSlug}-${counter++}`;
      }
      body.slug = slug;
    }
  }

  const anime = await Anime.findByIdAndUpdate(params.id, body, {
    new: true,
    runValidators: true
  });

  if (!anime) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(anime);
}

export async function DELETE(_request, { params }) {
  await connectDB();
  const anime = await Anime.findByIdAndDelete(params.id);
  if (!anime) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
