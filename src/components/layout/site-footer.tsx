import Link from "next/link";
import { Braces } from "@/components/brand/brand-shapes";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { WaveEdge } from "@/components/ui/wave-band";
import { getMembers, getSite } from "@/lib/content";
import { FooterNames } from "./footer-names";

// Sitenin yapımcısı; kod ve tasarımın hakları onda (LICENSE).
// Kişisel marka adı bulununca sadece burası değişir.
export const AUTHOR = { name: "Nida Akdoğan", url: "https://nidaakdogan.vercel.app" };

// Yayın sırasında hesaplanır; haftalık senkron siteyi yeniden yayınladığı için yıl güncel kalır
const YEAR = new Date().getFullYear();

type FooterLink = { label: string; href: string };

function footerLinks() {
  const site = getSite();
  const pages: FooterLink[] = [
    { label: "Ana sayfa", href: "/" },
    { label: "Hakkımızda", href: "/hakkimizda" },
    { label: "Ekip", href: "/ekip" },
    { label: "Etkinlikler", href: "/etkinlikler" },
    { label: "İletişim", href: "/#iletisim" },
  ];
  const social: FooterLink[] = [
    { label: "Instagram", href: site.links.instagram },
    { label: "LinkedIn", href: site.links.linkedin },
    { label: "GDG Community", href: site.links.gdgCommunity },
    { label: "WhatsApp", href: site.links.whatsapp },
  ];
  return { site, pages, social };
}

export function SiteFooter() {
  const names = getMembers().map((m) => ({ slug: m.slug, name: m.name, photoUrl: m.photoUrl }));
  return (
    <footer className="mt-auto">
      {/* Core team'in adları footer'ın üstünde akar; sayfa genişliğini taşar */}
      <div className="mt-16 mb-6">
        <FooterNames members={names} />
      </div>
      <FooterCompact />
    </footer>
  );
}

/** Tek satır logo + menü + katıl; altında sosyal linkler, bağımsızlık notu, telif ve imza. */
function FooterCompact() {
  const { site, pages, social } = footerLinks();
  return (
    <div>
      <WaveEdge fill="var(--surface)" />
      <div className="bg-surface">
        <div className="mx-auto max-w-content px-4 pt-8 pb-10 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-6">
            <div className="flex items-center gap-4">
              <Logo className="h-7" />
              <span className="hidden lg:inline">
                <Braces className="text-xl whitespace-nowrap">On Campus</Braces>
              </span>
            </div>
            <nav aria-label="Alt menü">
              <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                {pages.map((item) => (
                  <li key={item.href}>
                    <FooterAnchor {...item} />
                  </li>
                ))}
              </ul>
            </nav>
            <ButtonLink href={site.links.coreTeamForm} tone="blue">
              Aramıza katıl
            </ButtonLink>
          </div>

          <div className="mt-10 grid items-end gap-10 border-t border-border pt-8 md:grid-cols-[1fr_auto]">
            <div className="space-y-4">
              <nav aria-label="Sosyal medya">
                <ul className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-sm">
                  {social.map((item) => (
                    <li key={item.href}>
                      <FooterAnchor {...item} />
                    </li>
                  ))}
                  <li>
                    <a href={`mailto:${site.email}`} className="hover:underline">
                      {site.email}
                    </a>
                  </li>
                </ul>
              </nav>
              <p className="max-w-xl text-xs text-fg-subtle">{site.disclaimer}</p>
              <Copyright />
            </div>
            <Credit large />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────── ortak parçalar ───────────── */

function FooterAnchor({ label, href }: FooterLink) {
  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className="hover:underline">
        {label} <span aria-hidden>↗</span>
        <span className="sr-only"> (yeni sekmede açılır)</span>
      </a>
    );
  }
  return (
    <Link href={href} className="hover:underline">
      {label}
    </Link>
  );
}

/** İçerik topluluğun; kod ve tasarım ayrı imzada (LICENSE). */
function Copyright() {
  const site = getSite();
  return (
    <p className="font-mono text-xs text-fg-subtle">
      © {YEAR} {site.shortName} · <span className="whitespace-nowrap">{site.hashtag}</span>
    </p>
  );
}

/** Yapımcı imzası: küçük etiket + kişisel siteye giden isim. */
function Credit({ large }: { large?: boolean }) {
  return (
    <p className="space-y-1 sm:text-right">
      <span className="block font-mono text-[0.7rem] tracking-[0.2em] text-fg-subtle uppercase">
        tasarım & geliştirme
      </span>
      <a
        href={AUTHOR.url}
        target="_blank"
        rel="author noreferrer"
        className={`group inline-flex items-center gap-1.5 font-bold hover:underline ${large ? "text-2xl" : "text-lg"}`}
      >
        {AUTHOR.name}
        <span
          aria-hidden
          className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        >
          ↗
        </span>
        <span className="sr-only"> (kişisel site, yeni sekmede açılır)</span>
      </a>
    </p>
  );
}
