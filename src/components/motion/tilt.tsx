"use client";

import { useRef, type ReactNode } from "react";
import { useReducedMotion } from "./use-reduced-motion";

/** Fareyi takip ederek hafifçe 3B eğilen sarmalayıcı. Dokunmatik ve "hareketi azalt"ta düz kalır. */
export function Tilt({ children, max = 6 }: { children: ReactNode; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || reduced || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(700px) rotateX(${-y * max}deg) rotateY(${x * max}deg)`;
  }

  function reset() {
    if (ref.current) ref.current.style.transform = "";
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className="h-full transition-transform duration-200 ease-out will-change-transform"
    >
      {children}
    </div>
  );
}
