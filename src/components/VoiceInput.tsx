"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";


type RecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
};
type RecognitionCtor = new () => RecognitionLike;

function getCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const errorText: Record<string, string> = {
  "not-allowed": "মাইক ব্যবহারের অনুমতি দাও (ঠিকানার পাশের তালা চিহ্নে চাপ দিয়ে)",
  "service-not-allowed": "মাইক ব্যবহারের অনুমতি দাও (ঠিকানার পাশের তালা চিহ্নে চাপ দিয়ে)",
  "no-speech": "কিছু শোনা যায়নি, আবার চেষ্টা করো",
  "audio-capture": "মাইক খুঁজে পাওয়া যাচ্ছে না",
  network: "ইন্টারনেট সংযোগে সমস্যা, কণ্ঠস্বর শনাক্ত করা যায়নি",
  "language-not-supported": "এই ব্রাউজারে বাংলা কণ্ঠ-শনাক্তকরণ চলছে না",
};

export default function VoiceInput({
  onText,
  onError,
  disabled,
}: {
  onText: (text: string) => void;
  onError: (message: string) => void;
  disabled?: boolean;
}) {
 
  const supported = useSyncExternalStore(
    () => () => {},
    () => getCtor() !== null,
    () => false
  );
  const [listening, setListening] = useState(false);
  const recRef = useRef<RecognitionLike | null>(null);

  if (!supported) return null;

  function toggle() {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const Ctor = getCtor();
    if (!Ctor) return;

    const rec = new Ctor();
    rec.lang = "bn-BD";
    rec.interimResults = false;
    rec.continuous = false;

    rec.onresult = (e) => {
      const text = e.results[0]?.[0]?.transcript;
      if (text) onText(text.trim());
    };
    rec.onerror = (e) => onError(errorText[e.error] ?? "শুনতে সমস্যা হয়েছে, আবার চেষ্টা করো");
    rec.onend = () => setListening(false);

    recRef.current = rec;
    onError("");
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  }

  return (
    <motion.button
      type="button"
      onClick={toggle}
      disabled={disabled}
      aria-label={listening ? "শোনা বন্ধ করো" : "বলে সার্চ করো"}
      title={listening ? "শুনছি... বলো" : "বলে সার্চ করো"}
      animate={listening ? { scale: [1, 1.12, 1] } : { scale: 1 }}
      transition={listening ? { repeat: Infinity, duration: 1 } : {}}
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors disabled:opacity-50 ${
     listening ? "border-red-500 bg-red-500 text-white" : "border-slate-300 bg-white hover:bg-slate-50"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
      </svg>
    </motion.button>
  );
}