"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import RoadmapTimeline, { type ServiceView } from "@/components/RoadmapTimeline";

type ApiResult = { found: boolean; intro?: string; service?: ServiceView; error?: string };

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApiResult | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setData(null);
    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      setData(await res.json());
    } catch {
      setData({ found: false, error: "সংযোগে সমস্যা হয়েছে, আবার চেষ্টা করো" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <motion.h1
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold"
      >
        সরকারি সেবা নেভিগেটর
      </motion.h1>
      <p className="mt-2 opacity-80">তোমার সমস্যাটা সাধারণ ভাষায় লেখো, কী করতে হবে আমরা দেখিয়ে দেব।</p>

      <form onSubmit={submit} className="mt-6 flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="যেমন: NID কার্ডে আমার নাম ভুল আছে"
          className="flex-1 rounded-xl border border-gray-400/50 bg-transparent px-4 py-3 outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white disabled:opacity-60"
        >
          {loading ? "খুঁজছি..." : "খুঁজুন"}
        </button>
      </form>

      <div className="mt-8">
        {data?.found && data.service && (
          <RoadmapTimeline key={data.service.title} intro={data.intro ?? ""} service={data.service} />
        )}
        {data && !data.found && (
          <p className="rounded-xl border border-gray-400/40 p-4">
            {data.error ?? "এই সমস্যার সাথে মেলে এমন কোনো সেবা এখনো আমাদের তালিকায় নেই।"}
          </p>
        )}
      </div>
    </main>
  );
}