"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Arc, Asterisk, Circles, Slashes } from "./brand-shapes";

// Giriş bölümünün arka planı: logodaki hap şekilleri ve marka rehberinin çizgi şekilleri.
// Logonun kendisi değildir; logo yerine kullanılmaz.
// Havada süzülür ve fareyi hafifçe takip eder (derinlik: depth).

type Item = {
  x: number;
  y: number;
  depth: number;
  delay: number;
  rotate?: number;
  spin?: boolean;
  node: ReactNode;
};

const pill = (fill: string, w: number) => (
  <span
    className="block h-14 rounded-full border-[3px] border-ink-black shadow-sticker sm:h-20"
    style={{ width: w, background: fill }}
  />
);

const items: Item[] = [
  { x: 58, y: 8, depth: 18, delay: 0, rotate: -35, node: pill("var(--brand-red)", 170) },
  { x: 83, y: 3, depth: 12, delay: -4, rotate: 35, node: pill("var(--brand-green)", 220) },
  { x: 50, y: 72, depth: 30, delay: -2, rotate: 35, node: pill("var(--brand-blue)", 200) },
  { x: 92, y: 62, depth: 22, delay: -3, node: <Arc className="h-32 w-auto text-ink-black" /> },
  { x: 78, y: 82, depth: 16, delay: -1, node: <Circles className="h-12 w-auto text-ink-black" /> },
  { x: 51, y: 50, depth: 26, delay: -5, node: <Slashes className="h-20 w-auto text-ink-black" /> },
  {
    x: 47,
    y: 30,
    depth: 10,
    delay: 0,
    spin: true,
    node: <Asterisk className="h-12 w-12 text-fg" />,
  },
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
      {items.map((item, i) => (
        <span
          key={i}
          className="absolute transition-transform duration-500 ease-out"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            transform: `translate(calc(var(--px, 0) * ${item.depth}px * -1), calc(var(--py, 0) * ${item.depth}px * -1))`,
          }}
        >
          <span
            className={`block ${item.spin ? "animate-spin-slow" : "animate-float"}`}
            style={{
              animationDelay: `${item.delay}s`,
              rotate: item.rotate ? `${item.rotate}deg` : undefined,
            }}
          >
            {item.node}
          </span>
        </span>
      ))}
    </div>
  );
}
