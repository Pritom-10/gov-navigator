import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { embed } from "../src/lib/embed";

const prisma = new PrismaClient();
const DIR = path.join(process.cwd(), "prisma", "data", "services");

type ServiceFile = {
  slug: string;
  titleBn: string;
  titleEn: string;
  category: string;
  description: string;
  officeType: string;
  feeBdt: number | null;
  feeNote: string | null;
  timeEstimate: string | null;
  sourceUrl: string;
  verifiedAt: string;
  steps: { titleBn: string; detailBn: string }[];
  documents: { nameBn: string; required: boolean; note: string | null }[];
};

function check(raw: string, s: ServiceFile): string | null {
  if (raw.includes("<<")) return "এখনো <<placeholder>> আছে";
  if (!s.sourceUrl?.startsWith("https://") || !s.sourceUrl.includes(".gov.bd"))
    return "sourceUrl অবশ্যই https দিয়ে শুরু আর .gov.bd সাইটের হতে হবে";
  if (Number.isNaN(Date.parse(s.verifiedAt))) return "verifiedAt সঠিক তারিখ নয় (YYYY-MM-DD)";
  if (!s.steps?.length) return "অন্তত একটা ধাপ লাগবে";
  return null;
}

async function main() {
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".json"));

  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(DIR, file), "utf8");
      const s: ServiceFile = JSON.parse(raw);

      const problem = check(raw, s);
      if (problem) {
        console.log(`skipped: ${file} -> ${problem}`);
        continue;
      }

      await prisma.service.deleteMany({ where: { slug: s.slug } });

      const created = await prisma.service.create({
        data: {
          slug: s.slug,
          titleBn: s.titleBn,
          titleEn: s.titleEn,
          category: s.category,
          description: s.description,
          officeType: s.officeType,
          feeBdt: s.feeBdt,
          feeNote: s.feeNote,
          timeEstimate: s.timeEstimate,
          sourceUrl: s.sourceUrl,
          verifiedAt: new Date(s.verifiedAt),
          steps: {
            create: s.steps.map((st, i) => ({ order: i + 1, titleBn: st.titleBn, detailBn: st.detailBn })),
          },
          documents: { create: s.documents },
        },
      });

      const vec = JSON.stringify(
        await embed(`${s.titleBn} ${s.titleEn} ${s.category} ${s.description}`)
      );
      await prisma.$executeRaw`UPDATE "Service" SET embedding = ${vec}::vector WHERE id = ${created.id}`;
      console.log(`seeded: ${s.slug}`);
    } catch (e) {
      console.log(`failed: ${file} ->`, e);
    }
  }
}

main().finally(() => prisma.$disconnect());