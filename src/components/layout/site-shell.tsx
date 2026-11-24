import type { ReactNode } from "react";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

/**
 * Sitenin herkese açık sayfalarının çerçevesi: üst menü, ilerleme şeridi, footer (isim şeridiyle).
 * (site) yerleşimi ve kök 404 sayfası kullanır; panel ve giriş sayfası kullanmaz.
 */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#icerik"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2"
      >
        İçeriğe geç
      </a>
      <SiteHeader />
      <ScrollProgress />
      <main id="icerik" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <SmoothScroll />
    </>
  );
}
