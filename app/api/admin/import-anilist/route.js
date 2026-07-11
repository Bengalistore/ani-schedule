import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { fetchAiringWindow, fetchUpcoming } from "@/lib/anilist";
import { upsertAnimeList } from "@/lib/anilistSync";

export async function POST(request) {
  await connectDB();

  const body = await request.json().catch(() => ({}));
  const mode = body.mode || "both"; // "airing" | "upcoming" | "both"

  try {
    const items = [];
    if (mode === "airing" || mode === "both") {
      items.push(...(await fetchAiringWindow({ days: 7 })));
    }
    if (mode === "upcoming" || mode === "both") {
      items.push(...(await fetchUpcoming({ limit: 30 })));
    }

    const result = await upsertAnimeList(items);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }
}
