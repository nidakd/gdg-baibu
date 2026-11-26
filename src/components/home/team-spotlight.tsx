"use client";

// Ana sayfada core team: bir kişi büyük fotoğrafı, rolü ve tanıtımının başıyla öne çıkar;
// yanda herkesin küçük fotoğrafı, tıklayınca o kişi gelir. Birkaç saniyede bir sıradakine geçer,
// üstüne gelince ya da "hareketi azalt"ta durur.

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { initials } from "@/lib/format";

export type SpotlightMember = {
  slug: string;
  name: string;
  role: string;
  team: string;
  photoUrl: string | null;
  intro: string | null;
};

const INTERVAL = 6000;

export function TeamSpotlight({ members }: { members: SpotlightMember[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const m = members[index];

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % members.length), INTERVAL);
    return () => clearTimeout(id);
  }, [index, paused, members.length]);

  return (
    <div
      className="grid gap-8 rounded-card border-[3px] border-border-strong bg-surface p-5 shadow-sticker-lg sm:p-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <Link
        href={`/ekip/${m.slug}`}
        className="group grid items-center gap-6 sm:grid-cols-[12rem_1fr]"
        aria-live="polite"
      >
        <span className="relative mx-auto block aspect-square w-48 -rotate-2 overflow-hidden rounded-2xl border-[3px] border-ink-black bg-surface-2 shadow-sticker transition group-hover:rotate-0">
          {m.photoUrl ? (
            <Image
              key={m.slug}
              src={m.photoUrl}
              alt=""
              fill
              sizes="12rem"
              className="animate-[spotlight-in_400ms_ease-out] object-cover"
            />
          ) : (
            <span className="grid h-full place-items-center font-mono text-3xl">
              {initials(m.name)}
            </span>
          )}
        </span>
        <span key={m.slug} className="block animate-[spotlight-in_400ms_ease-out] space-y-2">
          <span className="block font-mono text-xs text-fg-subtle">
            {m.team} · {m.role}
          </span>
          <span className="block text-3xl font-bold tracking-tight group-hover:underline">
            {m.name}
          </span>
          <span className="line-clamp-3 min-h-[4.5rem] text-fg-muted">{m.intro}</span>
          <span className="inline-block pt-1 font-mono text-sm">profili aç →</span>
        </span>
      </Link>

      <ul className="flex flex-wrap justify-center gap-2.5 lg:justify-end" aria-label="Core team">
        {members.map((p, i) => (
          <li key={p.slug}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-label={p.name}
              aria-pressed={i === index}
              className={`relative block size-14 overflow-hidden rounded-full border-2 transition duration-300 ${
                i === index
                  ? "scale-110 border-ink-black ring-4 ring-yellow"
                  : "border-border-strong opacity-70 grayscale hover:scale-105 hover:opacity-100 hover:grayscale-0"
              }`}
            >
              {p.photoUrl ? (
                <Image src={p.photoUrl} alt="" fill sizes="3.5rem" className="object-cover" />
              ) : (
                <span className="grid h-full place-items-center bg-surface-2 font-mono text-sm">
                  {initials(p.name)}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
      <style>{`@keyframes spotlight-in { from { opacity: 0; transform: translateY(6px); } }`}</style>
    </div>
  );
}
