"use client";

import { useEffect, useState } from "react";
import type { Tone } from "@/components/ui/button";

type NavTeam = { id: string; count: number; tone: Tone };

const dot: Record<Tone, string> = {
  blue: "bg-blue",
  green: "bg-green",
  yellow: "bg-yellow",
  red: "bg-red",
  lilac: "bg-lilac",
  silver: "bg-silver",
};

/** `team/` klasör ağacı; kaydırırken ekranda olan ekibi işaretler. */
export function TeamNav({ teams }: { teams: NavTeam[] }) {
  const [active, setActive] = useState(teams[0]?.id);

  useEffect(() => {
    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
        // ekranın üst yarısına en çok giren ekip aktif
        const best = [...visible.entries()].sort((a, b) => b[1] - a[1])[0];
        if (best && best[1] > 0) setActive(best[0]);
      },
      { rootMargin: "-80px 0px -45% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    for (const t of teams) {
      const el = document.getElementById(t.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [teams]);

  return (
    <nav aria-label="Ekipler" className="lg:sticky lg:top-8 lg:self-start">
      <p className="mb-3 font-mono text-xs text-fg-subtle">team/</p>
      <ul className="space-y-1 font-mono text-sm">
        {teams.map((team, i) => {
          const isActive = team.id === active;
          return (
            <li key={team.id}>
              <a
                href={`#${team.id}`}
                aria-current={isActive ? "location" : undefined}
                className={`flex items-center justify-between rounded-lg border-2 px-2 py-1.5 transition ${
                  isActive
                    ? "border-border-strong bg-surface shadow-sticker-sm"
                    : "border-transparent hover:bg-surface"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span aria-hidden className="text-fg-subtle">
                    {i === teams.length - 1 ? "└─" : "├─"}
                  </span>
                  <span
                    aria-hidden
                    className={`size-2.5 rounded-full border border-ink-black transition-transform ${dot[team.tone]} ${isActive ? "scale-125" : ""}`}
                  />
                  {team.id}/
                </span>
                <span className="text-fg-subtle">{team.count}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
