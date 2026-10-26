"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type RandomLinkButtonProps = {
  /** Aralarından rastgele birine gidilecek adresler */
  hrefs: string[];
  label: string;
};

/** Zar atıp listeden rastgele bir sayfaya götüren buton (rastgele etkinlik, rastgele üye). */
export function RandomLinkButton({ hrefs, label }: RandomLinkButtonProps) {
  const router = useRouter();
  // rolling: zar animasyonu, isPending: sayfa geçişi sürüyor.
  // Geçiş bitince isPending kendiliğinden false olur; geri gelindiğinde buton takılı kalmaz.
  const [rolling, setRolling] = useState(false);
  const [isPending, startTransition] = useTransition();
  const busy = rolling || isPending;

  function roll() {
    if (busy || hrefs.length === 0) return;
    setRolling(true);
    const href = hrefs[Math.floor(Math.random() * hrefs.length)];
    setTimeout(() => {
      startTransition(() => router.push(href));
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
      {busy ? "Zar atılıyor…" : label}
    </button>
  );
}
