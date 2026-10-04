import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { embed } from "@/lib/embed";

export async function POST(req: Request) {
  const { query } = await req.json();
  if (!query || typeof query !== "string") {
    return NextResponse.json({ error: "query required" }, { status: 400 });
  }

  const vec = JSON.stringify(await embed(query));

  const results = await db.$queryRaw<
    { id: string; slug: string; titleBn: string; distance: number }[]
  >`
    SELECT id, slug, "titleBn", embedding <=> ${vec}::vector AS distance
    FROM "Service"
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> ${vec}::vector
    LIMIT 3
  `;

  return NextResponse.json({ results });
}