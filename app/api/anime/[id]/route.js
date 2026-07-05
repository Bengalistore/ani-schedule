import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Anime from "@/models/Anime";
import { slugify } from "@/lib/slugify";

// Next.js 15+ makes `params` an async value — it must be awaited before
// reading properties off it, otherwise `params.id` is undefined.
async function getId(params) {
  const resolved = await params;
  return resolved.id;
}

export async function GET(_request, { params }) {
  await connectDB();
  const id = await getId(params);
  const anime = await Anime.findById(id).lean();
  if (!anime) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(anime);
}

export async function PUT(request, { params }) {
  await connectDB();
  const id = await getId(params);
  const body = await request.json();

  // Re-slug if the English title changed.
  if (body.titleEnglish) {
    const current = await Anime.findById(id).lean();
    if (current && slugify(body.titleEnglish) !== current.slug) {
      const baseSlug = slugify(body.titleEnglish);
      let slug = baseSlug;
      let counter = 1;
      while (await Anime.exists({ slug, _id: { $ne: id } })) {
        slug = `${baseSlug}-${counter++}`;
      }
      body.slug = slug;
    }
  }

  const anime = await Anime.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true
  });

  if (!anime) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(anime);
}

export async function DELETE(_request, { params }) {
  await connectDB();
  const id = await getId(params);
  const anime = await Anime.findByIdAndDelete(id);
  if (!anime) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
