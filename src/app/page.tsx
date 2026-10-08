"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import RoadmapTimeline, { type ServiceView } from "@/components/RoadmapTimeline";
import VoiceInput from "@/components/VoiceInput";

type ApiResult = { found: boolean; intro?: string; service?: ServiceView; error?: string };

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApiResult | null>(null);
  const [voiceMsg, setVoiceMsg] = useState("");

  async function search(q: string) {
    if (!q.trim()) return;
    setLoading(true);
    setData(null);
    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      setData(await res.json());
    } catch {
      setData({ found: false, error: "সংযোগে সমস্যা হয়েছে, আবার চেষ্টা করো" });
    } finally {
      setLoading(false);
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    search(query);
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <motion.h1
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold print:hidden"
      >
        সরকারি সেবা নেভিগেটর
      </motion.h1>
      <p className="mt-2 opacity-80 print:hidden">
        তোমার সমস্যাটা সাধারণ ভাষায় লেখো বা মাইকে বলো, কী করতে হবে আমরা দেখিয়ে দেব।
      </p>

      <form onSubmit={submit} className="mt-6 flex gap-2 print:hidden">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="যেমন: NID কার্ডে আমার নাম ভুল আছে"
          className="flex-1 rounded-xl border border-gray-400/50 bg-transparent px-4 py-3 outline-none focus:border-emerald-500"
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
          className="rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white disabled:opacity-60"
        >
          {loading ? "খুঁজছি..." : "খুঁজুন"}
        </button>
      </form>

      {voiceMsg && <p className="mt-2 text-sm text-red-500 print:hidden">{voiceMsg}</p>}
      <p className="mt-2 text-xs opacity-60 print:hidden">
        মাইক ব্যবহার করলে তোমার কণ্ঠস্বর ব্রাউজারের বাক-শনাক্তকরণ সেবায় (Chrome-এ Google-এর সার্ভারে) পাঠানো হয়।
      </p>

      <div className="mt-8">
        {data?.found && data.service && (
          <RoadmapTimeline key={data.service.title} intro={data.intro ?? ""} service={data.service} />
        )}
        {data && !data.found && (
          <p className="rounded-xl border border-gray-400/40 p-4 print:hidden">
            {data.error ?? "এই সমস্যার সাথে মেলে এমন কোনো সেবা এখনো আমাদের তালিকায় নেই।"}
          </p>
        )}
      </div>

      <footer className="mt-16 border-t border-gray-400/30 pt-4 text-xs opacity-70 print:hidden">
        এটি একটি শেখার ও পোর্টফোলিও প্রকল্প, কোনো সরকারি সংস্থার ওয়েবসাইট নয়। অফিসে যাওয়ার আগে অবশ্যই সরকারি সূত্রে তথ্য মিলিয়ে নিন।
      </footer>
    </main>
  );
}