"use client";

import { useEffect, useState, useSyncExternalStore } from "react";


function subscribe(onChange: () => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return () => {};
  window.speechSynthesis.addEventListener("voiceschanged", onChange);
  return () => window.speechSynthesis.removeEventListener("voiceschanged", onChange);
}

function hasBengaliVoice() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  return window.speechSynthesis.getVoices().some((v) => v.lang.toLowerCase().startsWith("bn"));
}

export default function ReadAloud({ text }: { text: string }) {
  const available = useSyncExternalStore(subscribe, hasBengaliVoice, () => false);
  const [speaking, setSpeaking] = useState(false);


  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  function toggle() {
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }

    const voices = synth.getVoices();
    const voice =
      voices.find((v) => v.lang.toLowerCase().replace("_", "-") === "bn-bd") ??
      voices.find((v) => v.lang.toLowerCase().startsWith("bn"));

  
    const chunks = text.split(/(?<=[।.?!])\s+/).filter(Boolean);
    chunks.forEach((chunk, i) => {
      const u = new SpeechSynthesisUtterance(chunk);
      u.lang = "bn-BD";
      if (voice) u.voice = voice;
      if (i === chunks.length - 1) u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      synth.speak(u);
    });
    setSpeaking(true);
  }

  if (!available) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      className="mt-3 rounded-xl border border-gray-400/50 px-4 py-2 text-sm"
    >
      {speaking ? "থামাও" : "পড়ে শোনাও"}
    </button>
  );
}