"use client";

// Footer'ın üstünde core team'in adları: büyük yazı, üç satır ters yönlerde akar.
// Üstüne gelince satır durur ve ismin yanında fotoğraf açılır; isim profile gider.
// Süs: klavye sırasına ve ekran okuyucuya girmez (kayan satırda odaklanan isim ekran dışında
// kalabiliyor); aynı kişiler ekip sayfasında listeli.
// Renk yok: adların arasında nötr bir nokta. "Hareketi azalt"ta satırlar sabit.

import Image from "next/image";
import Link from "next/link";

export type FooterName = { slug: string; name: string; photoUrl: string | null };

// Bir satırda 4–5 isim var; tek tur geniş ekrandan kısa kalıp arada boşluk bırakmasın diye
// satır birkaç kez art arda dizilir. Hız aynı kalsın diye süre de tekrar sayısıyla çarpılır.
const REPEAT = 4;

export function FooterNames({ members }: { members: FooterName[] }) {
  const rows = [0, 1, 2].map((r) => {
    const row = members.filter((_, i) => i % 3 === r);
    return Array.from({ length: REPEAT }, () => row).flat();
  });
  return (
    <div
      aria-hidden
      className="footer-names space-y-3 overflow-hidden py-2"
      style={{ maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)" }}
    >
      <style>{`
        .footer-names-row { animation: footer-names var(--dur) linear infinite; }
        .footer-names-row[data-rev] { animation-direction: reverse; }
        .footer-names-row:hover { animation-play-state: paused; }
        @keyframes footer-names { to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) { .footer-names-row { animation: none; } }
      `}</style>
      {rows.map((row, r) => (
        <div
          key={r}
          className="footer-names-row flex w-max"
          data-rev={r % 2 ? "" : undefined}
          style={{ ["--dur" as string]: `${(40 + r * 8) * REPEAT}s` }}
        >
          {[0, 1].map((copy) =>
            row.map((m, i) => (
              <Link
                key={`${copy}-${i}-${m.slug}`}
                href={`/ekip/${m.slug}`}
                tabIndex={-1}
                className="group flex shrink-0 items-center gap-3 pr-8"
              >
                {m.photoUrl && (
                  <span className="relative size-0 overflow-hidden rounded-full ring-border-strong transition-all duration-300 group-hover:size-10 group-hover:ring-[3px]">
                    <Image src={m.photoUrl} alt="" fill sizes="3rem" className="object-cover" />
                  </span>
                )}
                <span className="text-3xl font-bold tracking-tight whitespace-nowrap text-fg/85 transition group-hover:text-fg sm:text-4xl">
                  {m.name}
                </span>
                <span aria-hidden className="size-2.5 shrink-0 rounded-full bg-fg/25" />
              </Link>
            )),
          )}
        </div>
      ))}
    </div>
  );
}
