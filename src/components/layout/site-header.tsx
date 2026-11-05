import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { getSite } from "@/lib/content";

const nav = [
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/ekip", label: "Ekip" },
  { href: "/etkinlikler", label: "Etkinlikler" },
];

export function SiteHeader() {
  const site = getSite();

  return (
    <header className="relative z-40 border-b border-border bg-bg">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between gap-4 px-4 sm:px-6">
        <Logo className="h-6 sm:h-8" />

        <nav aria-label="Ana menü" className="hidden items-center gap-6 md:flex">
          {nav.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
          <ButtonLink href={site.links.coreTeamForm} tone="blue">
            Aramıza katıl
          </ButtonLink>
        </nav>

        <details className="group relative md:hidden">
          <summary className="flex size-10 cursor-pointer list-none items-center justify-center rounded-full border-2 border-border-strong bg-surface shadow-sticker-sm [&::-webkit-details-marker]:hidden">
            <span className="sr-only">Menüyü aç</span>
            <span aria-hidden className="font-mono text-sm group-open:hidden">
              ≡
            </span>
            <span aria-hidden className="hidden font-mono text-sm group-open:inline">
              ✕
            </span>
          </summary>
          <nav
            aria-label="Mobil menü"
            className="absolute right-0 mt-3 flex w-56 flex-col gap-1 rounded-card border-2 border-border-strong bg-surface p-3 shadow-sticker"
          >
            {nav.map((link) => (
              <NavLink key={link.href} {...link} block />
            ))}
            <div className="mt-2">
              <ButtonLink href={site.links.coreTeamForm} tone="blue">
                Aramıza katıl
              </ButtonLink>
            </div>
          </nav>
        </details>
      </div>
    </header>
  );
}

function NavLink({ href, label, block }: { href: string; label: string; block?: boolean }) {
  const external = /^https?:\/\//.test(href);
  const className = block
    ? "rounded-lg px-3 py-2 text-sm hover:bg-surface-2"
    : "text-sm text-fg-muted hover:text-fg";
  return external ? (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {label} <span aria-hidden>↗</span>
    </a>
  ) : (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}
