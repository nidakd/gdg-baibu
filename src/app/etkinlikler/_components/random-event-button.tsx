"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Arşivden rastgele bir etkinliğe götüren zar butonu. */
export function RandomEventButton({ slugs }: { slugs: string[] }) {
  const router = useRouter();
  const [rolling, setRolling] = useState(false);

  function roll() {
    if (rolling || slugs.length === 0) return;
    setRolling(true);
    const slug = slugs[Math.floor(Math.random() * slugs.length)];
    // zar dönsün diye kısa bir bekleme
    setTimeout(() => router.push(`/etkinlikler/${slug}`), 550);
  }

  return (
    <button
      type="button"
      onClick={roll}
      className="inline-flex items-center gap-2 rounded-full border-2 border-border-strong bg-red-halftone px-5 py-2.5 text-sm font-medium text-ink-black shadow-sticker-sm transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-sticker active:translate-x-0 active:translate-y-0 active:shadow-none"
    >
      <span aria-hidden className={`inline-block text-lg ${rolling ? "animate-roll" : ""}`}>
        🎲
      </span>
      {rolling ? "Zar atılıyor…" : "Rastgele bir etkinlik"}
    </button>
  );
}
