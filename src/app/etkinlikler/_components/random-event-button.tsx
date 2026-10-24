"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

/** Arşivden rastgele bir etkinliğe götüren zar butonu. */
export function RandomEventButton({ slugs }: { slugs: string[] }) {
  const router = useRouter();
  // rolling: zar animasyonu, isPending: sayfa geçişi sürüyor.
  // Geçiş bitince isPending kendiliğinden false olur; geri gelindiğinde buton takılı kalmaz.
  const [rolling, setRolling] = useState(false);
  const [isPending, startTransition] = useTransition();
  const busy = rolling || isPending;

  function roll() {
    if (busy || slugs.length === 0) return;
    setRolling(true);
    const slug = slugs[Math.floor(Math.random() * slugs.length)];
    setTimeout(() => {
      startTransition(() => router.push(`/etkinlikler/${slug}`));
      setRolling(false);
    }, 550);
  }

  return (
    <button
      type="button"
      onClick={roll}
      aria-busy={busy}
      className="inline-flex items-center gap-2 rounded-full border-2 border-border-strong bg-surface px-5 py-2.5 text-sm font-medium shadow-sticker-sm transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-sticker active:translate-x-0 active:translate-y-0 active:shadow-none"
    >
      <span aria-hidden className={`inline-block text-lg ${rolling ? "animate-roll" : ""}`}>
        🎲
      </span>
      {busy ? "Zar atılıyor…" : "Rastgele bir etkinlik"}
    </button>
  );
}
