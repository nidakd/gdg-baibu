import type { Tone } from "@/components/ui/button";
import { getStats } from "@/lib/insights";

// Marka rehberinin halftone tonları: koyu yazıyla en canlı ve okunur kombinasyon
const tones: Record<Tone, string> = {
  blue: "bg-blue-halftone",
  green: "bg-green-halftone",
  yellow: "bg-yellow-halftone",
  red: "bg-red-halftone",
  lilac: "bg-lilac-halftone",
  silver: "bg-silver-halftone",
};

export function StatsGrid() {
  return (
    <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {getStats().map((stat) => (
        <div
          key={stat.label}
          className={`rounded-card border-2 border-ink-black p-5 text-ink-black shadow-sticker ${tones[stat.tone]}`}
        >
          <dt className="font-mono text-xs sm:text-sm">{stat.label}</dt>
          <dd className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}
