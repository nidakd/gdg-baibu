import type { ReactNode } from "react";
import type { Tone } from "./button";

// Sitedeki bütün rakam kartları (ana sayfa, hakkımızda, ekip, etkinlikler, bölümler).
// Açık temada pastel zemin; koyu temada zemin nötr kalır, renk sadece rakamda görünür
// (koyu pasteller çamurlu duruyordu).

const tones: Record<Tone, string> = {
  blue: "bg-blue-soft dark:[&_dd]:text-blue-ink",
  green: "bg-green-soft dark:[&_dd]:text-green-ink",
  yellow: "bg-yellow-soft dark:[&_dd]:text-yellow-ink",
  red: "bg-red-soft dark:[&_dd]:text-red-ink",
  lilac: "bg-lilac-soft dark:[&_dd]:text-lilac-ink",
  silver: "bg-silver-soft dark:[&_dd]:text-silver-ink",
};

const sizes = {
  lg: {
    box: "rounded-card p-5 shadow-sticker",
    dt: "text-xs sm:text-sm",
    dd: "mt-1 text-4xl sm:text-5xl",
  },
  md: {
    box: "rounded-xl px-4 py-3 shadow-sticker-sm",
    dt: "text-[11px] sm:text-xs",
    dd: "text-3xl sm:text-4xl",
  },
  sm: { box: "rounded-xl px-3 py-2.5 shadow-sticker-sm", dt: "text-[11px]", dd: "text-3xl" },
};

export function StatTile({
  label,
  value,
  tone,
  size = "lg",
}: {
  label: string;
  value: ReactNode;
  tone: Tone;
  size?: keyof typeof sizes;
}) {
  const s = sizes[size];
  return (
    <div
      className={`border-2 border-border-strong text-fg dark:border-border dark:bg-surface ${s.box} ${tones[tone]}`}
    >
      <dt className={`font-mono text-fg-muted ${s.dt}`}>{label}</dt>
      <dd className={`font-bold tracking-tight ${s.dd}`}>{value}</dd>
    </div>
  );
}
