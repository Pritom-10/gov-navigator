"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import DraftGenerator from "./DraftGenerator";
import ReadAloud from "./ReadAloud";
import PrintView from "./PrintView";

export type ServiceView = {
  slug: string;
  title: string;
  office: string;
  fee: string | null;
  time: string | null;
  sourceUrl: string | null;
  verified: boolean;
  verifiedAt: string | null;
  daysSinceVerified: number | null;
  steps: { id: string; title: string; detail: string }[];
  documents: { id: string; name: string; required: boolean; note: string | null }[];
};

function Tick({ checked }: { checked: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3.5">
      <motion.path
        d="M5 13l4 4L19 7"
        initial={false}
        animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </svg>
  );
}

export default function RoadmapTimeline({
  intro,
  service,
}: {
  intro: string;
  service: ServiceView;
}) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [draft, setDraft] = useState("");
  const toggle = (id: string) => setDone((d) => ({ ...d, [id]: !d[id] }));

  const allIds = [...service.steps.map((s) => s.id), ...service.documents.map((d) => d.id)];
  const doneCount = allIds.filter((id) => done[id]).length;
  const percent = allIds.length ? Math.round((doneCount / allIds.length) * 100) : 0;

    const readText = [
    intro,
    ...service.steps.map((s, i) => `ধাপ ${i + 1}। ${s.title}। ${s.detail}`),
    service.documents.length
      ? "যে কাগজ লাগবে। " + service.documents.map((d) => d.name).join("। ")
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
    <div className="space-y-8 print:hidden">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-gray-400/40 p-5"
      >
        <h2 className="text-xl font-semibold">{service.title}</h2>

                {service.daysSinceVerified === null ? (
          <p className="mt-2 text-sm text-amber-500">
            সতর্কতা: এই তথ্য এখনো যাচাই করা হয়নি। অফিসে যাওয়ার আগে সরকারি ওয়েবসাইটে মিলিয়ে নাও।
          </p>
        ) : service.daysSinceVerified > 90 ? (
          <p className="mt-2 text-sm text-amber-500">
            সতর্কতা: তথ্যটি {service.daysSinceVerified} দিন আগে যাচাই করা, নিয়ম বদলে থাকতে পারে। অফিসে যাওয়ার আগে সরকারি সূত্রে মিলিয়ে নাও।
          </p>
        ) : (
          <p className="mt-2 text-sm opacity-70">
            তথ্য যাচাইয়ের তারিখ: {new Date(service.verifiedAt!).toLocaleDateString("bn-BD")}
          </p>
        )}

        {intro && <p className="mt-3 leading-relaxed">{intro}</p>}
                <button
          type="button"
          onClick={() => window.print()}
          className="mr-2 mt-3 rounded-xl border border-gray-400/50 px-4 py-2 text-sm"
        >
          প্রিন্ট / PDF করো
        </button>
        <ReadAloud text={readText} />

        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-gray-500/15 px-3 py-1">অফিস: {service.office}</span>
          {service.fee && <span className="rounded-full bg-gray-500/15 px-3 py-1">ফি: {service.fee}</span>}
          {service.time && <span className="rounded-full bg-gray-500/15 px-3 py-1">সময়: {service.time}</span>}
        </div>

        {service.sourceUrl && (
          <a href={service.sourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm underline">
            সরকারি সূত্র দেখো
          </a>
        )}
      </motion.div>

      <div>
        <div className="mb-1 flex justify-between text-sm">
          <span>অগ্রগতি</span>
          <span>{percent}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-500/20">
          <motion.div
            className="h-full rounded-full bg-emerald-500"
            animate={{ width: `${percent}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
      </div>

      <section>
        <h3 className="mb-4 text-lg font-semibold">ধাপে ধাপে প্রক্রিয়া</h3>
        <ol className="space-y-4 border-l-2 border-gray-400/40 pl-6">
          {service.steps.map((step, i) => (
            <motion.li
              key={step.id}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 * i }}
              className="relative"
            >
              <button
                onClick={() => toggle(step.id)}
                className={`absolute left-[-2.35rem] flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${
                  done[step.id]
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-gray-400/60 bg-transparent"
                }`}
                aria-label={`ধাপ ${i + 1} সম্পন্ন`}
              >
                {done[step.id] ? <Tick checked /> : i + 1}
              </button>
              <p className={`font-medium ${done[step.id] ? "line-through opacity-60" : ""}`}>{step.title}</p>
              <p className="mt-1 text-sm opacity-80">{step.detail}</p>
            </motion.li>
          ))}
        </ol>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-semibold">যে কাগজ লাগবে</h3>
        <ul className="space-y-2">
          {service.documents.map((doc, i) => (
            <motion.li
              key={doc.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <button
                onClick={() => toggle(doc.id)}
                className="flex w-full items-center gap-3 rounded-xl border border-gray-400/40 p-3 text-left"
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                    done[doc.id] ? "border-emerald-500 bg-emerald-500 text-white" : "border-gray-400/60"
                  }`}
                >
                  <Tick checked={!!done[doc.id]} />
                </span>
                <span className={done[doc.id] ? "line-through opacity-60" : ""}>
                  {doc.name}
                  {!doc.required && <span className="ml-2 text-xs opacity-70">(ঐচ্ছিক)</span>}
                  {doc.note && <span className="block text-sm opacity-70">{doc.note}</span>}
                </span>
              </button>
            </motion.li>
          ))}
        </ul>
      </section>
            <DraftGenerator slug={service.slug} draft={draft} setDraft={setDraft} />
              
    </div>
    <PrintView service={service} intro={intro} done={done} draft={draft} />
     </>
    
  );
}