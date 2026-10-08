"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import RoadmapTimeline, { type ServiceView } from "./RoadmapTimeline";
import VoiceInput from "./VoiceInput";

export type CategoryView = {
  name: string;
  items: { slug: string; title: string }[];
};

type ApiResult = { found: boolean; intro?: string; service?: ServiceView; error?: string };


const palette = [
  { badge: "bg-emerald-100 text-emerald-700", bar: "bg-emerald-500", hover: "hover:border-emerald-300 hover:bg-emerald-50" },
  { badge: "bg-sky-100 text-sky-700", bar: "bg-sky-500", hover: "hover:border-sky-300 hover:bg-sky-50" },
  { badge: "bg-violet-100 text-violet-700", bar: "bg-violet-500", hover: "hover:border-violet-300 hover:bg-violet-50" },
  { badge: "bg-amber-100 text-amber-700", bar: "bg-amber-500", hover: "hover:border-amber-300 hover:bg-amber-50" },
  { badge: "bg-rose-100 text-rose-700", bar: "bg-rose-500", hover: "hover:border-rose-300 hover:bg-rose-50" },
  { badge: "bg-teal-100 text-teal-700", bar: "bg-teal-500", hover: "hover:border-teal-300 hover:bg-teal-50" },
];

const examples = [
  "NID কার্ডে আমার নাম ভুল আছে",
  "নতুন বাচ্চার জন্ম নিবন্ধন করতে চাই",
  "জন্ম সনদে আমার নাম ভুল আছে",
];

const howItWorks = [
  { n: "১", title: "লেখো বা বলো", text: "সমস্যাটা সাধারণ ভাষায়" },
  { n: "২", title: "ধাপ ও কাগজ দেখো", text: "কী করতে হবে, কী লাগবে" },
  { n: "৩", title: "খসড়া নাও", text: "আবেদনপত্র তৈরি, প্রিন্টও করা যাবে" },
];

export default function HomeClient({ categories }: { categories: CategoryView[] }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApiResult | null>(null);
  const [voiceMsg, setVoiceMsg] = useState("");

  const browsing = !loading && !data;

  async function request(body: { query?: string; slug?: string }) {
    setLoading(true);
    setData(null);
    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setData(await res.json());
    } catch {
      setData({ found: false, error: "সংযোগে সমস্যা হয়েছে, আবার চেষ্টা করো" });
    } finally {
      setLoading(false);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function search(q: string) {
    if (q.trim()) request({ query: q });
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    search(query);
  }

  function goHome() {
    setData(null);
    setQuery("");
    setVoiceMsg("");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* উপরের বার */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/85 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-3">
          <button onClick={goHome} className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-lg font-bold text-white">
              স
            </span>
            <span className="text-lg font-bold">সরকারি সেবা নেভিগেটর</span>
          </button>
          <span className="ml-auto rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
            পরীক্ষামূলক
          </span>
        </div>
      </header>

      
      <section className="bg-linear-to-b from-emerald-50 via-emerald-50/40 to-slate-50 print:hidden">
        <div className="mx-auto max-w-3xl px-5 pb-10 pt-12 text-center">
          {browsing && (
            <>
              <motion.h1
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold leading-tight sm:text-5xl"
              >
                সরকারি সেবা, <span className="text-emerald-600">সহজ ভাষায়</span>
              </motion.h1>
              <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
                তোমার সমস্যাটা লেখো বা মাইকে বলো, অথবা নিচের বিভাগ থেকে সেবা বেছে নাও।
              </p>
            </>
          )}

          <form
            onSubmit={submit}
            className={`${browsing ? "mt-8" : ""} flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg shadow-emerald-900/5`}
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="যেমন: NID কার্ডে আমার নাম ভুল আছে"
              className="min-w-0 flex-1 bg-transparent px-3 py-3 text-base outline-none placeholder:text-slate-400"
            />
            <VoiceInput
              disabled={loading}
              onError={setVoiceMsg}
              onText={(text) => {
                setQuery(text);
                search(text);
              }}
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? "খুঁজছি..." : "খুঁজুন"}
            </button>
          </form>

          {voiceMsg && <p className="mt-3 text-sm text-red-600">{voiceMsg}</p>}

          {browsing && (
            <>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {examples.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => {
                      setQuery(ex);
                      search(ex);
                    }}
                    className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-700 transition-colors hover:border-emerald-300 hover:text-emerald-700"
                  >
                    {ex}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-500">
                মাইক ব্যবহার করলে কণ্ঠস্বর ব্রাউজারের বাক-শনাক্তকরণ সেবায় (Chrome-এ Google-এর সার্ভারে) পাঠানো হয়।
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {howItWorks.map((h) => (
                  <div key={h.n} className="rounded-2xl bg-white/70 p-4 text-left ring-1 ring-slate-200">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
                      {h.n}
                    </span>
                    <p className="mt-2 font-semibold">{h.title}</p>
                    <p className="text-sm text-slate-600">{h.text}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-5 pb-16">
        
        {browsing && (
          <section className="mt-6 print:hidden">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">সব সেবা, বিভাগ অনুযায়ী</h2>
              <p className="mt-1 text-slate-600">
                বিভাগ থেকে সেবা বেছে নিলে সরাসরি ধাপ ও কাগজের তালিকা পাবে।
              </p>
            </div>

            {categories.length === 0 ? (
              <p className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-600">
                কোনো সেবার তালিকা পাওয়া যায়নি। সার্চ বাক্স ব্যবহার করে দেখো।
              </p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {categories.map((cat, i) => {
                  const c = palette[i % palette.length];
                  return (
                    <motion.div
                      key={cat.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.06 * i }}
                      whileHover={{ y: -3 }}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                    >
                      <div className={`h-1 ${c.bar}`} />
                      <div className="p-5">
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold ${c.badge}`}
                          >
                            {Array.from(cat.name)[0]}
                          </span>
                          <div>
                            <h3 className="font-semibold">{cat.name}</h3>
                            <p className="text-xs text-slate-500">
                              {cat.items.length.toLocaleString("bn-BD")}টি সেবা
                            </p>
                          </div>
                        </div>

                        <ul className="mt-4 space-y-2">
                          {cat.items.map((item) => (
                            <li key={item.slug}>
                              <button
                                onClick={() => request({ slug: item.slug })}
                                className={`flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left text-sm transition-colors ${c.hover}`}
                              >
                                <span>{item.title}</span>
                                <span aria-hidden className="text-slate-400">→</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        
        {loading && (
          <div className="mx-auto mt-8 max-w-3xl animate-pulse space-y-4 print:hidden">
            <div className="h-44 rounded-2xl bg-slate-200" />
            <div className="h-20 rounded-2xl bg-slate-200" />
            <div className="h-32 rounded-2xl bg-slate-200" />
          </div>
        )}

        
        {data && (
          <div className="mx-auto mt-8 max-w-3xl">
            <button
              onClick={goHome}
              className="mb-4 text-sm font-medium text-emerald-700 hover:underline print:hidden"
            >
              ← সব সেবা দেখো
            </button>

            {data.found && data.service ? (
              <RoadmapTimeline key={data.service.slug} intro={data.intro ?? ""} service={data.service} />
            ) : (
              <p className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-700 print:hidden">
                {data.error ?? "এই সমস্যার সাথে মেলে এমন কোনো সেবা এখনো আমাদের তালিকায় নেই। উপরের বিভাগ থেকে খুঁজে দেখো।"}
              </p>
            )}
          </div>
        )}

        <footer className="mt-16 border-t border-slate-200 pt-4 text-xs text-slate-500 print:hidden">
          এটি একটি শেখার ও পোর্টফোলিও প্রকল্প, কোনো সরকারি সংস্থার ওয়েবসাইট নয়। অফিসে যাওয়ার আগে অবশ্যই সরকারি সূত্রে তথ্য মিলিয়ে নিন।
        </footer>
      </main>
    </div>
  );
}