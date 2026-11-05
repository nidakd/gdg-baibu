"use client";

// Havalimanı kalkış tablosu gibi: her ekip bir satır, birkaç saniyede bir o ekipteki
// sıradaki kişinin adı harf harf dönerek belirir. "Hareketi azalt"ta isimler değişmez.

import Link from "next/link";
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/components/motion/use-reduced-motion";
import { badge, type CreditMember } from "./credit-member";

const CELLS = 20;
const pad = (s: string) => s.toLocaleUpperCase("tr").slice(0, CELLS).padEnd(CELLS, " ");

export function FlapBoard({ members }: { members: CreditMember[] }) {
  const reduced = useReducedMotion();
  const teams = [...new Set(members.map((m) => m.team))];
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setTick((t) => t + 1), 3200);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <div className="flapboard overflow-hidden rounded-card border-2 border-border-strong bg-ink-black p-4 text-off-white shadow-sticker sm:p-5">
      <style>{`
        .flap { display: inline-grid; place-items: center; width: 1.05em; height: 1.5em; margin-right: 2px;
          border-radius: 3px; background: #2b2b2b; box-shadow: inset 0 -1px 0 #000, inset 0 1px 0 #3a3a3a;
          position: relative; transform-origin: 50% 50%; }
        .flap::after { content: ""; position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: #111; }
        .flap.go { animation: flap .45s cubic-bezier(.3,.7,.4,1) both; }
        @keyframes flap { 0% { transform: rotateX(90deg); opacity: .3; } 100% { transform: rotateX(0); opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { .flap.go { animation: none; } }
      `}</style>
      <div className="mb-3 flex items-center justify-between font-mono text-[11px] text-off-white/60">
        <span>ekip / team</span>
        <span>isim / name</span>
      </div>
      <ul className="space-y-2">
        {teams.map((team, row) => {
          const list = members.filter((m) => m.team === team);
          const m = list[(tick + row) % list.length];
          const text = pad(m.name);
          return (
            <li key={team} className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span
                className={`w-28 shrink-0 rounded px-1.5 py-0.5 font-mono text-[11px] font-bold ${badge[m.tone]}`}
              >
                {team}/
              </span>
              <Link
                href={`/ekip/${m.slug}`}
                aria-label={`${m.name}, ${m.role}`}
                className="font-mono text-[13px] font-bold tracking-wider whitespace-pre sm:text-sm"
              >
                {[...text].map((ch, i) => (
                  <span
                    key={`${m.slug}-${i}`}
                    className={`flap ${ch === " " ? "" : "go"}`}
                    style={{ animationDelay: `${i * 35}ms` }}
                  >
                    {ch === " " ? "\u00a0" : ch}
                  </span>
                ))}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
