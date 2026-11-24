import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { AUTHOR } from "@/components/layout/site-footer";
import { getSite } from "@/lib/content";
import { openGraph, SITE_URL } from "@/lib/seo";
import { googleSans, googleSansCode } from "@/styles/fonts";
import "@/styles/globals.css";

const site = getSite();

const description = `${site.university} Google Developer Group topluluğu: biz kimiz, ne yapıyoruz, ekibimiz ve etkinliklerimiz.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: site.shortName,
    template: `%s · ${site.shortName}`,
  },
  description,
  // Sitenin tasarımcısı ve geliştiricisi (<meta name="author">, <link rel="author">)
  authors: [{ name: AUTHOR.name, url: AUTHOR.url }],
  creator: AUTHOR.name,
  // Paylaşım görseli: app/opengraph-image.tsx (alt sayfalar da bunu kullanır)
  openGraph: openGraph({ description }),
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${googleSans.variable} ${googleSansCode.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        {/* Vercel Web Analytics: çerez kullanmaz, sadece yayında (Vercel'de) veri toplar */}
        <Analytics />
      </body>
    </html>
  );
}
