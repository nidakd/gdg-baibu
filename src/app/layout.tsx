import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSite } from "@/lib/content";
import { googleSans, googleSansCode } from "./fonts";
import "./globals.css";

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
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2"
        >
          İçeriğe geç
        </a>
        <SiteHeader />
        <main id="icerik" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
