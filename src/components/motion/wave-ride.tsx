"use client";

import { useEffect, useRef, type ReactNode } from "react";

type WaveRideProps = {
  children: ReactNode;
  /** Dalga yüksekliği (px) */
  amplitude?: number;
  /** Dalga boyu (px) */
  wavelength?: number;
  className?: string;
};

/**
 * İçindeki [data-wave-item] öğelerini, ekrandaki yatay konumlarına göre bir sinüs dalgası
 * üzerinde yukarı aşağı oynatır; kayan bir şeritte öğeler dalganın üstünde ilerliyormuş gibi görünür.
 * Eğim yönünde hafifçe de döner. Ekranda değilken ve "hareketi azalt" açıkken çalışmaz.
 */
export function WaveRide({
  children,
  amplitude = 14,
  wavelength = 640,
  className = "",
}: WaveRideProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const items = [...root.querySelectorAll<HTMLElement>("[data-wave-item]")];
    const k = (2 * Math.PI) / wavelength;
    let raf = 0;
    let visible = false;

    const frame = () => {
      const left = root.getBoundingClientRect().left;
      for (const el of items) {
        const r = el.getBoundingClientRect();
        const x = r.left - left + r.width / 2;
        const y = amplitude * Math.sin(k * x);
        const slope = amplitude * k * Math.cos(k * x);
        el.style.translate = `0 ${y.toFixed(1)}px`;
        el.style.rotate = `${((Math.atan(slope) * 180) / Math.PI).toFixed(1)}deg`;
      }
      raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(frame);
    });
    io.observe(root);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [amplitude, wavelength]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
