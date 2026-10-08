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

const card = "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm";

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

  const tiles = [
    { label: "কোথায় যেতে হবে", value: service.office, wide: true },
    { label: "ফি", value: service.fee, wide: false },
    { label: "সময়", value: service.time, wide: false },
  ].filter((t) => t.value);

  return (
    <>
      <div className="space-y-6 print:hidden">
        {/* সেবার পরিচিতি */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
          <div className="p-6">
            <h2 className="text-2xl font-bold text-slate-900">{service.title}</h2>

            {service.daysSinceVerified === null ? (
              <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                এই তথ্য এখনো যাচাই করা হয়নি। অফিসে যাওয়ার আগে সরকারি ওয়েবসাইটে মিলিয়ে নাও।
              </p>
            ) : service.daysSinceVerified > 90 ? (
              <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                তথ্যটি {service.daysSinceVerified} দিন আগে যাচাই করা, নিয়ম বদলে থাকতে পারে। অফিসে যাওয়ার আগে সরকারি সূত্রে মিলিয়ে নাও।
              </p>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                তথ্য যাচাইয়ের তারিখ: {new Date(service.verifiedAt!).toLocaleDateString("bn-BD")}
              </p>
            )}

            {intro && (
              <div className="mt-4 rounded-xl bg-emerald-50 p-4 leading-relaxed text-slate-700">
                {intro}
              </div>
            )}

            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              {tiles.map((t) => (
                <div key={t.label} className={`rounded-xl bg-slate-50 p-4 ${t.wide ? "sm:col-span-2" : ""}`}>
                  <dt className="text-xs font-medium text-slate-500">{t.label}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-slate-800">{t.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50"
              >
                প্রিন্ট / PDF করো
              </button>
              <ReadAloud text={readText} />
              {service.sourceUrl && (
                <a
                  href={service.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto text-sm font-medium text-emerald-700 hover:underline"
                >
                  সরকারি সূত্র দেখো ↗
                </a>
              )}
            </div>
          </div>
        </motion.div>

        {/* অগ্রগতি */}
        <div className={card}>
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-medium">তোমার অগ্রগতি</span>
            <span className="text-slate-500">
              {doneCount}/{allIds.length} সম্পন্ন · {percent}%
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <motion.div
              className="h-full rounded-full bg-emerald-500"
              animate={{ width: `${percent}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
        </div>

        {/* ধাপ */}
        <section className={card}>
          <h3 className="mb-5 text-lg font-semibold">ধাপে ধাপে প্রক্রিয়া</h3>
          <ol className="relative ml-4 space-y-6 border-l-2 border-slate-200 pl-8">
            {service.steps.map((step, i) => (
              <motion.li
                key={step.id}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12 * i }}
                className="relative"
              >
                <button
                  onClick={() => toggle(step.id)}
                  className={`absolute -left-[3.0625rem] flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${
                    done[step.id]
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-slate-300 bg-white text-slate-600 hover:border-emerald-400"
                  }`}
                  aria-label={`ধাপ ${i + 1} সম্পন্ন`}
                >
                  {done[step.id] ? <Tick checked /> : i + 1}
                </button>
                <p className={`font-semibold ${done[step.id] ? "text-slate-400 line-through" : "text-slate-900"}`}>
                  {step.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{step.detail}</p>
              </motion.li>
            ))}
          </ol>
        </section>

        {/* কাগজ */}
        <section className={card}>
          <h3 className="mb-4 text-lg font-semibold">যে কাগজ লাগবে</h3>
          <ul className="space-y-2">
            {service.documents.map((doc, i) => (
              <motion.li
                key={doc.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i }}
              >
                <button
                  onClick={() => toggle(doc.id)}
                  className="flex w-full items-start gap-3 rounded-xl border border-slate-200 p-3 text-left transition-colors hover:bg-slate-50"
                >
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                      done[doc.id] ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300"
                    }`}
                  >
                    <Tick checked={!!done[doc.id]} />
                  </span>
                  <span className="flex-1">
                    <span className={`text-sm ${done[doc.id] ? "text-slate-400 line-through" : "text-slate-900"}`}>
                      {doc.name}
                    </span>
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                        doc.required ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {doc.required ? "আবশ্যক" : "ঐচ্ছিক"}
                    </span>
                    {doc.note && <span className="mt-1 block text-xs text-slate-500">{doc.note}</span>}
                  </span>
                </button>
              </motion.li>
            ))}
          </ul>
        </section>

        {/* খসড়া */}
        <div className={card}>
          <DraftGenerator slug={service.slug} draft={draft} setDraft={setDraft} />
        </div>
      </div>

      <PrintView service={service} intro={intro} done={done} draft={draft} />
    </>
  );
}