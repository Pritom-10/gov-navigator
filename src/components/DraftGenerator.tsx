"use client";

import { useState, type ChangeEvent, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { motion } from "framer-motion";

const inputClass =
  "w-full rounded-xl border border-gray-400/50 bg-transparent px-4 py-2.5 outline-none focus:border-emerald-500";

export default function DraftGenerator({ slug,
  draft,
  setDraft,
}: {
  slug: string;
  draft: string;
  setDraft: Dispatch<SetStateAction<string>>; }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    fatherName: "",
    address: "",
    phone: "",
    problem: "",
  });
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const set =
    (key: keyof typeof form) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

   async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setDraft("");
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, ...form }),
      });

     
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "কিছু একটা ভুল হয়েছে");
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setError("উত্তর পড়া যাচ্ছে না, আবার চেষ্টা করো");
        return;
      }

   
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setDraft((d) => d + decoder.decode(value, { stream: true }));
      }
    } catch {
      setError("সংযোগে সমস্যা হয়েছে, আবার চেষ্টা করো");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section>
      <h3 className="mb-4 text-lg font-semibold">আবেদনপত্রের খসড়া</h3>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white"
        >
          খসড়া তৈরি করো
        </button>
      ) : (
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <input className={inputClass} placeholder="তোমার নাম *" value={form.name} onChange={set("name")} required />
          <input className={inputClass} placeholder="পিতার নাম" value={form.fatherName} onChange={set("fatherName")} />
          <input className={inputClass} placeholder="ঠিকানা (গ্রাম/মহল্লা, উপজেলা, জেলা) *" value={form.address} onChange={set("address")} required />
          <input className={inputClass} placeholder="মোবাইল নম্বর" value={form.phone} onChange={set("phone")} />
          <textarea
            className={inputClass}
            rows={3}
            placeholder="সমস্যাটা সংক্ষেপে লেখো, যেমন: NID কার্ডে আমার নাম ভুল ছাপা হয়েছে *"
            value={form.problem}
            onChange={set("problem")}
            required
          />

          <p className="text-xs opacity-70">
            তোমার দেওয়া তথ্য আমরা সংরক্ষণ করি না, তবে খসড়া বানাতে AI সেবায় (Google) পাঠানো হয়।
            NID, পাসপোর্ট বা অন্য পরিচয় নম্বর এখানে লিখো না।
          </p>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white disabled:opacity-60"
          >
            {loading ? "লিখছি..." : "খসড়া বানাও"}
          </button>
        </motion.form>
      )}

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      {draft && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 space-y-2">
          <textarea
            className={`${inputClass} font-[inherit] leading-relaxed`}
            rows={16}
            readOnly={loading}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div className="flex items-center gap-3">
            <button onClick={copy} className="rounded-xl border border-gray-400/50 px-4 py-2">
              {copied ? "কপি হয়েছে" : "কপি করো"}
            </button>
            <span className="text-xs opacity-70">
              এটা শুধু খসড়া। [এখানে লিখুন] ঘরগুলো পূরণ করে, নিজে পড়ে ঠিক করে তবেই জমা দিও।
            </span>
          </div>
        </motion.div>
      )}
    </section>
  );
}