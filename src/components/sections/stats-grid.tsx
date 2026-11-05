import type { Tone } from "@/components/ui/button";
import { getStats } from "@/lib/insights";

// Pastel (soft) tonlar: sayfa sakin kalsın; koyu temada koyu karşılıklarına döner
const tones: Record<Tone, string> = {
  blue: "bg-blue-soft",
  green: "bg-green-soft",
  yellow: "bg-yellow-soft",
  red: "bg-red-soft",
  lilac: "bg-lilac-soft",
  silver: "bg-silver-soft",
};

export async function StatsGrid() {
  const stats = await getStats();
  return (
    <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`rounded-card border-2 border-border-strong p-5 shadow-sticker ${tones[stat.tone]}`}
        >
          <dt className="font-mono text-xs sm:text-sm">{stat.label}</dt>
          <dd className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}
