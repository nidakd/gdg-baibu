"use client";

// Numaralı isim listesi; bir ismin üstüne gelince fotoğrafı imlecin yanında belirip onu takip eder.
// Dokunmatik ekranda fotoğraf çıkmaz, liste profillere bağlanır.

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { badge, ring, type CreditMember } from "./credit-member";

export function HoverIndex({
  members,
  columns = 1,
}: {
  members: CreditMember[];
  /** Geniş ekranda iki sütun */
  columns?: 1 | 2;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState<number | null>(null);
  const current = active === null ? null : members[active];

  return (
    <div
      ref={box}
      className="relative"
      onMouseMove={(e) => {
        const r = box.current!.getBoundingClientRect();
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
      onMouseLeave={() => setActive(null)}
    >
      <ol className={columns === 2 ? "gap-x-12 lg:columns-2" : ""}>
        {members.map((m, i) => (
          <li key={m.slug} className="break-inside-avoid">
            <Link
              href={`/ekip/${m.slug}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              className={`group grid grid-cols-[2.25rem_1fr_auto] items-center gap-3 border-b border-border py-2.5 transition-opacity ${
                active !== null && active !== i ? "opacity-40" : ""
              }`}
            >
              <span className="font-mono text-xs text-fg-subtle">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="truncate text-lg font-bold tracking-tight transition-transform duration-300 group-hover:translate-x-2 sm:text-xl">
                {m.name}
              </span>
              <span className={`rounded-full px-2 py-0.5 font-mono text-[11px] ${badge[m.tone]}`}>
                {m.team}/
              </span>
            </Link>
          </li>
        ))}
      </ol>
      {/* İmleci takip eden fotoğraf (dokunmatikte görünmez) */}
      <span
        aria-hidden
        className={`pointer-events-none absolute top-0 left-0 z-20 hidden h-36 w-28 overflow-hidden rounded-2xl shadow-sticker ring-[3px] transition-[opacity,scale,translate] duration-300 ease-out [@media(hover:hover)]:block ${
          current ? `scale-100 opacity-100 ${ring[current.tone]}` : "scale-75 opacity-0"
        }`}
        style={{ translate: `${pos.x + 36}px ${pos.y - 72}px`, rotate: "-4deg" }}
      >
        {current?.photoUrl && (
          <Image src={current.photoUrl} alt="" fill sizes="9rem" className="object-cover" />
        )}
      </span>
    </div>
  );
}
