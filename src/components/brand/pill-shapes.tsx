"use client";

import { useEffect, useRef } from "react";

// Logodaki dört hap şeklinden türetilmiş dekoratif arka plan öğeleri.
// Logonun kendisi değildir; logo yerine kullanılmaz.
// Havada süzülür ve fareyi hafifçe takip eder (derinlik: depth).

const pills = [
  { x: 58, y: 10, r: -35, fill: "var(--brand-red)", w: 170, depth: 18, delay: 0 },
  { x: 50, y: 70, r: 35, fill: "var(--brand-blue)", w: 220, depth: 30, delay: -2 },
  { x: 82, y: 4, r: 35, fill: "var(--brand-green)", w: 230, depth: 12, delay: -4 },
  { x: 86, y: 76, r: -35, fill: "var(--brand-yellow)", w: 160, depth: 24, delay: -1 },
];

export function PillShapes({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.setProperty("--px", String(e.clientX / window.innerWidth - 0.5));
        el.style.setProperty("--py", String(e.clientY / window.innerHeight - 0.5));
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {pills.map((p) => (
        <span
          key={p.fill}
          className="absolute transition-transform duration-500 ease-out"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            transform: `translate(calc(var(--px, 0) * ${p.depth}px * -1), calc(var(--py, 0) * ${p.depth}px * -1))`,
          }}
        >
          <span
            className="block animate-float"
            style={{ animationDelay: `${p.delay}s`, rotate: `${p.r}deg` }}
          >
            <span
              className="block h-14 rounded-full border-[3px] border-ink-black shadow-sticker sm:h-20"
              style={{ width: p.w, background: p.fill }}
            />
          </span>
        </span>
      ))}
    </div>
  );
}
