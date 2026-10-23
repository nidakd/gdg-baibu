"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";

/** Sayfa genelinde yumuşak kaydırma. "Hareketi azalt" açıksa devreye girmez. */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.1,
      // Yapışkan header'ın altında kalmasın
      anchors: { offset: -80 },
    });
    return () => lenis.destroy();
  }, []);

  return null;
}
