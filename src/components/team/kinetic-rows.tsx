"use client";

// Ekip isimleri büyük yazıyla, satırlar ters yönlerde akar; üstüne gelince satır durur
// ve ismin yanında fotoğraf açılır. "Hareketi azalt"ta satırlar sabit.

import Image from "next/image";
import Link from "next/link";
import { dot, ring, type CreditMember } from "./credit-member";

export function KineticRows({ members }: { members: CreditMember[] }) {
  const rows = [0, 1, 2].map((r) => members.filter((_, i) => i % 3 === r));
  return (
    <div
      className="kinetic space-y-3 overflow-hidden py-2"
      style={{ maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)" }}
    >
      <style>{`
        .kinetic-row { animation: kinetic var(--dur) linear infinite; }
        .kinetic-row[data-rev] { animation-direction: reverse; }
        .kinetic-row:hover { animation-play-state: paused; }
        @keyframes kinetic { to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) { .kinetic-row { animation: none; } }
      `}</style>
      {rows.map((row, r) => (
        <div
          key={r}
          className="kinetic-row flex w-max"
          data-rev={r % 2 ? "" : undefined}
          style={{ ["--dur" as string]: `${40 + r * 8}s` }}
        >
          {[0, 1].map((copy) =>
            row.map((m) => (
              <Link
                key={`${copy}-${m.slug}`}
                href={`/ekip/${m.slug}`}
                aria-hidden={copy === 1 || undefined}
                tabIndex={copy === 1 ? -1 : undefined}
                className="group flex shrink-0 items-center gap-3 pr-8"
              >
                {m.photoUrl && (
                  <span
                    className={`relative size-0 overflow-hidden rounded-full transition-all duration-300 group-hover:size-12 group-hover:ring-[3px] ${ring[m.tone]}`}
                  >
                    <Image src={m.photoUrl} alt="" fill sizes="3rem" className="object-cover" />
                  </span>
                )}
                <span className="text-4xl font-bold tracking-tight whitespace-nowrap text-fg/85 transition group-hover:text-fg sm:text-5xl">
                  {m.name}
                </span>
                <span aria-hidden className={`size-3 shrink-0 rounded-full ${dot[m.tone]}`} />
              </Link>
            )),
          )}
        </div>
      ))}
    </div>
  );
}
