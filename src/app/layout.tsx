import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { getSite } from "@/lib/content";
import { googleSans, googleSansCode } from "@/styles/fonts";
import "@/styles/globals.css";

const site = getSite();

export const metadata: Metadata = {
  title: {
    default: site.shortName,
    template: `%s · ${site.shortName}`,
  },
  description: `${site.university} Google Developer Group topluluğu: biz kimiz, ne yapıyoruz, ekibimiz ve etkinliklerimiz.`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${googleSans.variable} ${googleSansCode.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#icerik"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2"
        >
          İçeriğe geç
        </a>
        <SiteHeader />
        <main id="icerik" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <SmoothScroll />
      </body>
    </html>
  );
}
