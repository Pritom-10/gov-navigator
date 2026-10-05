import { db } from "./db";
import { embed } from "./embed";

export const MAX_DISTANCE = 0.65;

export async function findService(query: string) {
  const vec = JSON.stringify(await embed(query));

  const rows = await db.$queryRaw<{ id: string; distance: number }[]>`
    SELECT id, embedding <=> ${vec}::vector AS distance
    FROM "Service"
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> ${vec}::vector
    LIMIT 1
  `;

  const best = rows[0];
  if (!best || best.distance > MAX_DISTANCE) return null;

  return db.service.findUnique({
    where: { id: best.id },
    include: { steps: { orderBy: { order: "asc" } }, documents: true },
  });
}