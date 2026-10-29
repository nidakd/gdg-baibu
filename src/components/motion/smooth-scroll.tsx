"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Sayfa genelinde yumuşak kaydırma. "Hareketi azalt" açıksa devreye girmez.
 * Yeni bir sayfaya geçince en üstten başlatır: Next.js yeni sayfa ekranda göründüğü sürece
 * kaydırma konumunu korur, bu yüzden ekip listesinin altından açılan profil aşağıdan başlıyordu.
 * Geri/ileri gidişte tarayıcının hatırladığı konuma dokunulmaz.
 */
export function SmoothScroll() {
  const pathname = usePathname();
  const lenis = useRef<Lenis | null>(null);
  const historyNav = useRef(false);

  useEffect(() => {
    const onPopState = () => {
      historyNav.current = true;
    };
    window.addEventListener("popstate", onPopState);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return () => window.removeEventListener("popstate", onPopState);
    }
    lenis.current = new Lenis({
      autoRaf: true,
      lerp: 0.1,
      // Yapışkan header'ın altında kalmasın
      anchors: { offset: -80 },
    });
    return () => {
      window.removeEventListener("popstate", onPopState);
      lenis.current?.destroy();
      lenis.current = null;
    };
  }, []);

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (historyNav.current) {
      historyNav.current = false;
      return;
    }
    if (lenis.current) lenis.current.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
