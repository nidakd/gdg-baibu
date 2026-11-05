import Link from "next/link";
import { Braces } from "@/components/brand/brand-shapes";
import { Logo } from "@/components/brand/logo";
import { WaveEdge } from "@/components/ui/wave-band";
import { getSite } from "@/lib/content";
import { slugify } from "@/lib/slug";

// Sitenin yapımcısı; kod ve tasarımın hakları onda (LICENSE)
const AUTHOR = "Nida Akdoğan";

export function SiteFooter() {
  const site = getSite();
  const social = [
    { label: "Instagram", href: site.links.instagram },
    { label: "LinkedIn", href: site.links.linkedin },
    { label: "GDG Community", href: site.links.gdgCommunity },
    { label: "WhatsApp", href: site.links.whatsapp },
  ];
  const pages = [
    { label: "Hakkımızda", href: "/hakkimizda" },
    { label: "Ekip", href: "/ekip" },
    { label: "Etkinlikler", href: "/etkinlikler" },
  ];

  return (
    <footer className="mt-auto">
      <WaveEdge fill="var(--surface)" />
      <div className="bg-surface">
        <div className="mx-auto grid max-w-content gap-10 px-4 py-12 text-sm sm:px-6 md:grid-cols-[2fr_1fr_1fr]">
          <div className="space-y-4">
            <Logo className="h-7" />
            <p className="max-w-md text-fg-muted">{site.disclaimer}</p>
            <p>
              <a href={`mailto:${site.email}`} className="font-mono hover:underline">
                {site.email}
              </a>
            </p>
            <p className="text-2xl">
              <Braces>On Campus</Braces>
            </p>
            <p className="font-mono text-xs text-fg-subtle">{site.hashtag}</p>
          </div>
          <FooterList title="sayfalar" items={pages} />
          <FooterList title="bağlantılar" items={social} />
        </div>
        <div className="mx-auto max-w-content px-4 pb-8 sm:px-6">
          <p className="border-t border-border pt-5 font-mono text-xs text-fg-subtle">
            © 2026 · tasarım ve geliştirme:{" "}
            <Link href={`/ekip/${slugify(AUTHOR)}`} className="text-fg hover:underline">
              {AUTHOR}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterList({ title, items }: { title: string; items: { label: string; href: string }[] }) {
  return (
    <div className="space-y-3">
      <p className="font-mono text-xs text-fg-subtle">{`// ${title}`}</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.href}>
            {/^https?:\/\//.test(item.href) ? (
              <a href={item.href} target="_blank" rel="noreferrer" className="hover:underline">
                {item.label} <span aria-hidden>↗</span>
              </a>
            ) : (
              <Link href={item.href} className="hover:underline">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
