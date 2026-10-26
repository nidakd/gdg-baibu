"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { WAVE_HEIGHT, WAVE_WIDTH, waveY } from "@/lib/wave";

/**
 * İçindeki [data-wave-item] öğelerini, içinde bulunduğu dalgalı bandın (WaveBand) orta çizgisini
 * izleyecek şekilde yukarı aşağı oynatır ve eğime göre döndürür. Bandın üst ve alt kenarı aynı
 * eğriden çizildiği için öğeler bandın kıvrımlarıyla birebir uyuşur.
 * Ekranda değilken ve "hareketi azalt" açıkken çalışmaz.
 */
export function WaveRide({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    const band = root?.closest<HTMLElement>("[data-wave-band]");
    const edge = band?.querySelector("svg");
    if (!root || !band || !edge) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const items = [...root.querySelectorAll<HTMLElement>("[data-wave-item]")];
    let raf = 0;

    // Bandın orta çizgisinin, düz duruma göre kayması (px). x: bandın solundan uzaklık.
    // Üst kenar eğrinin kendisi, alt kenar 180° döndürülmüş hali: orta = iki kenarın ortalaması.
    const offsetAt = (x: number, width: number, scale: number) => {
      const xv = (x / width) * WAVE_WIDTH;
      return (scale * (waveY(xv) - waveY(WAVE_WIDTH - xv))) / 2;
    };

    const frame = () => {
      const box = band.getBoundingClientRect();
      const scale = edge.getBoundingClientRect().height / WAVE_HEIGHT;
      for (const el of items) {
        const r = el.getBoundingClientRect();
        // öğe sadece dikeyde kaydırıldığı için yatay merkezi güvenle ölçülebilir
        const x = r.left - box.left + r.width / 2;
        const y = offsetAt(x, box.width, scale);
        const slope = (offsetAt(x + 4, box.width, scale) - offsetAt(x - 4, box.width, scale)) / 8;
        el.style.translate = `0 ${y.toFixed(1)}px`;
        el.style.rotate = `${((Math.atan(slope) * 180) / Math.PI).toFixed(1)}deg`;
      }
      raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      if (entry.isIntersecting) raf = requestAnimationFrame(frame);
    });
    io.observe(root);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
