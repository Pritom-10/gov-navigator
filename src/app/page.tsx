import { db } from "@/lib/db";
import HomeClient, { type CategoryView } from "@/components/HomeClient";


export const dynamic = "force-dynamic";

async function loadCategories(): Promise<CategoryView[]> {
  try {
    const services = await db.service.findMany({
      select: { slug: true, titleBn: true, category: true },
      orderBy: [{ category: "asc" }, { titleBn: "asc" }],
    });

    const map = new Map<string, CategoryView["items"]>();
    for (const s of services) {
      const list = map.get(s.category) ?? [];
      list.push({ slug: s.slug, title: s.titleBn });
      map.set(s.category, list);
    }
    return Array.from(map.entries()).map(([name, items]) => ({ name, items }));
  } catch (e) {
    console.error("[home] বিভাগ লোড হয়নি:", e instanceof Error ? e.message : e);
    return [];
  }
}

export default async function Page() {
  const categories = await loadCategories();
  return <HomeClient categories={categories} />;
}