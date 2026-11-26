import Link from "next/link";
import { Braces } from "@/components/brand/brand-shapes";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { WaveEdge } from "@/components/ui/wave-band";
import { getMembers, getSite } from "@/lib/content";
import { getPostKindsWithContent, POST_KINDS } from "@/lib/posts";
import { getSiteLive } from "@/lib/settings";
import { FooterNames } from "./footer-names";
import { FooterNamesGate } from "./footer-names-gate";

// Sitenin yapımcısı; kod ve tasarımın hakları onda (LICENSE).
// Kişisel marka adı bulununca sadece burası değişir.
export const AUTHOR = { name: "Nida Akdoğan", url: "https://nidaakdogan.vercel.app" };

// Yayın sırasında hesaplanır; haftalık senkron siteyi yeniden yayınladığı için yıl güncel kalır
const YEAR = new Date().getFullYear();

type FooterLink = { label: string; href: string };

async function footerLinks() {
  const site = await getSiteLive();
  // Duyurular / projeler / kaynaklar sadece içerik varsa menüde
  const extra = (await getPostKindsWithContent()).map((k) => ({
    label: POST_KINDS[k].plural,
    href: POST_KINDS[k].path,
  }));
  const pages: FooterLink[] = [
    { label: "Ana sayfa", href: "/" },
    { label: "Hakkımızda", href: "/hakkimizda" },
    { label: "Ekip", href: "/ekip" },
    { label: "Etkinlikler", href: "/etkinlikler" },
    ...extra,
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

/** names: false ise isim şeridi hiç gösterilmez (404). Kısa sayfalarda ayrıca FooterNamesGate gizler. */
export async function SiteFooter({ names: showNames = true }: { names?: boolean }) {
  const names = showNames
    ? (await getMembers()).map((m) => ({ slug: m.slug, name: m.name, photoUrl: m.photoUrl }))
    : [];
  return (
    <footer className="mt-auto">
      {/* Core team'in adları footer'ın üstünde akar; sayfa genişliğini taşar */}
      {showNames ? (
        <FooterNamesGate>
          <FooterNames members={names} />
        </FooterNamesGate>
      ) : (
        <div className="mt-16" />
      )}
      <FooterCompact />
    </footer>
  );
}

/** Tek satır logo + menü + katıl; altında sosyal linkler, bağımsızlık notu, telif ve imza. */
async function FooterCompact() {
  const { site, pages, social } = await footerLinks();
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
              <ul className="flex flex-wrap gap-x-6 text-sm">
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
                <ul className="flex flex-wrap gap-x-5 font-mono text-sm">
                  {social.map((item) => (
                    <li key={item.href}>
                      <FooterAnchor {...item} />
                    </li>
                  ))}
                  <li>
                    <a href={`mailto:${site.email}`} className={LINK}>
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

// Dokunma alanı en az 24 px yüksek olsun (telefonda yan yana linkler kolay basılsın); boşluk dolguyla
// geldiği için satır arası (gap-y) küçük tutuldu.
const LINK = "inline-block py-1.5 hover:underline";

function FooterAnchor({ label, href }: FooterLink) {
  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={LINK}>
        {label} <span aria-hidden>↗</span>
        <span className="sr-only"> (yeni sekmede açılır)</span>
      </a>
    );
  }
  return (
    <Link href={href} className={LINK}>
      {label}
    </Link>
  );
}

/** İçerik topluluğun; kod ve tasarım ayrı imzada (LICENSE). */
function Copyright() {
  const site = getSite();
  return (
    <p className="font-mono text-xs text-fg-subtle">
      © {YEAR} {site.shortName} · <span className="whitespace-nowrap">{site.hashtag}</span> ·{" "}
      <Link href="/marka" className={LINK}>
        Marka rehberi
      </Link>{" "}
      ·{" "}
      <Link href="/gizlilik" className={LINK}>
        Gizlilik
      </Link>
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
