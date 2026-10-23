import Link from "next/link";
import type { ReactNode } from "react";

// Logodaki hap şekillerinden: siyah çerçeveli, sert gölgeli, renkli dolgu.
// Renkli zeminde yazı her zaman koyu (#1e1e1e); beyaz yazı çekirdek renklerde okunmaz.

export type Tone = "blue" | "green" | "yellow" | "red";

const tones: Record<Tone | "plain", string> = {
  blue: "bg-blue text-ink-black",
  green: "bg-green text-ink-black",
  yellow: "bg-yellow text-ink-black",
  red: "bg-red text-ink-black",
  plain: "bg-surface text-fg",
};

type ButtonLinkProps = {
  href: string;
  tone?: Tone | "plain";
  children: ReactNode;
};

export function ButtonLink({ href, tone = "blue", children }: ButtonLinkProps) {
  const external = /^https?:\/\//.test(href);
  const className = `inline-flex items-center gap-2 rounded-full border-2 border-border-strong px-5 py-2.5 text-sm font-medium shadow-sticker-sm transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-sticker active:translate-x-0 active:translate-y-0 active:shadow-none ${tones[tone]}`;

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {children}
        <span aria-hidden>↗</span>
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
