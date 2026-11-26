// Ana sayfa "etkinliklerden kareler": etkinlik fotoğrafları, her kare kendi etkinliğine gider.
// Fotoğraflar content/photos.json'da ve panelden yüklenenlerde ("ana sayfada göster" işaretli) (kaynak arşiv doc/fotograflar/, 1600 px'e küçültülüp EXIF'i silinmiş).

import Image from "next/image";
import Link from "next/link";
import type { Photo } from "@/lib/content";
import { formatDate } from "@/lib/format";

const TILTS = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2", "rotate-0", "-rotate-3"];

/** Fotoğrafın altında etkinlik adı ve tarihi: kod yorumu gibi küçük mono yazı. */
function Caption({ photo }: { photo: Photo }) {
  return (
    <span className="mt-2 flex items-baseline justify-between gap-3 px-1 font-mono text-xs">
      <span className="truncate font-bold group-hover:underline">{photo.event.title}</span>
      <span className="shrink-0 text-fg-subtle">{formatDate(photo.event.startsAt)}</span>
    </span>
  );
}

/**
 * Footer'daki isim şeridi gibi iki satır ters yönde akar, üstüne gelince durur.
 * Kayan satırda odaklanan kare ekran dışında kalabildiği için şerit süs: klavye ve ekran okuyucu
 * için altında "Tüm etkinlikler" bağlantısı yeterli.
 */
export function PhotoStrip({ photos }: { photos: Photo[] }) {
  const rows = [0, 1].map((r) => photos.filter((_, i) => i % 2 === r));
  return (
    <div
      aria-hidden
      // Bölüm kutusundan taşar, sayfa genişliğinde akar
      className="relative left-1/2 w-screen -translate-x-1/2 space-y-6 overflow-hidden py-4"
      style={{ maskImage: "linear-gradient(90deg, transparent, black 6%, black 94%, transparent)" }}
    >
      <style>{`
        .photo-row { animation: photo-row var(--dur) linear infinite; }
        .photo-row[data-rev] { animation-direction: reverse; }
        .photo-row:hover { animation-play-state: paused; }
        @keyframes photo-row { to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) { .photo-row { animation: none; } }
      `}</style>
      {rows.map((row, r) => (
        <div
          key={r}
          className="photo-row flex w-max gap-6 pr-6"
          data-rev={r ? "" : undefined}
          style={{ ["--dur" as string]: `${70 + r * 12}s` }}
        >
          {[0, 1].map((copy) =>
            row.map((p, i) => (
              <Link
                key={`${copy}-${p.src}`}
                href={`/etkinlikler/${p.event.slug}`}
                tabIndex={-1}
                className={`group block w-64 shrink-0 rounded-card border-[3px] border-border-strong bg-surface p-2 shadow-sticker transition duration-300 hover:z-10 hover:scale-105 hover:rotate-0 sm:w-80 ${TILTS[(i + r) % TILTS.length]}`}
              >
                <span className="relative block aspect-[4/3] overflow-hidden rounded-[0.8rem]">
                  <Image src={p.src} alt="" fill sizes="20rem" className="object-cover" />
                </span>
                <Caption photo={p} />
              </Link>
            )),
          )}
        </div>
      ))}
    </div>
  );
}
