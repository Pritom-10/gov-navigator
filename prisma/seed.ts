import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { embed } from "../src/lib/embed";

const prisma = new PrismaClient();

const services = [
  {
    slug: "nid-correction",
    titleBn: "জাতীয় পরিচয়পত্রে নাম সংশোধন",
    titleEn: "NID Name Correction",
    category: "NID",
    description: "NID কার্ডে নামের ভুল সংশোধনের প্রক্রিয়া",
    officeType: "উপজেলা/থানা নির্বাচন অফিস",
    feeNote: "TODO: official সাইট থেকে যাচাই করে বসাও",
    sourceUrl: null as string | null,
    steps: [
      { order: 1, titleBn: "TODO ধাপ ১", detailBn: "official সূত্র থেকে লেখো" },
      { order: 2, titleBn: "TODO ধাপ ২", detailBn: "official সূত্র থেকে লেখো" },
    ],
    documents: [{ nameBn: "TODO কাগজ ১", required: true }],
  },
];

async function main() {
  for (const s of services) {
    await prisma.service.deleteMany({ where: { slug: s.slug } });

    const created = await prisma.service.create({
      data: {
        slug: s.slug,
        titleBn: s.titleBn,
        titleEn: s.titleEn,
        category: s.category,
        description: s.description,
        officeType: s.officeType,
        feeNote: s.feeNote,
        sourceUrl: s.sourceUrl,
        steps: { create: s.steps },
        documents: { create: s.documents },
      },
    });

    const vec = JSON.stringify(
      await embed(`${s.titleBn} ${s.titleEn} ${s.category} ${s.description}`)
    );
    await prisma.$executeRaw`UPDATE "Service" SET embedding = ${vec}::vector WHERE id = ${created.id}`;
    console.log("seeded:", s.slug);
  }
}

main().finally(() => prisma.$disconnect());