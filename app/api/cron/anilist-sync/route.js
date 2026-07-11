import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { fetchAiringWindow, fetchUpcoming } from "@/lib/anilist";
import { upsertAnimeList } from "@/lib/anilistSync";

// Vercel Cron calls this on a schedule (see vercel.json) and automatically
// sends `Authorization: Bearer <CRON_SECRET>` as long as CRON_SECRET is set
// as an environment variable on the project.
export async function GET(request) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  try {
    const [airing, upcoming] = await Promise.all([
      fetchAiringWindow({ days: 7 }),
      fetchUpcoming({ limit: 30 })
    ]);

    const result = await upsertAnimeList([...airing, ...upcoming]);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }
}
