import Image from "next/image";
import Link from "next/link";
import type { Event } from "@/lib/content";
import { formatMonth } from "@/lib/format";

// Tek sıra halinde kayan küçük etkinlik afişleri. Sayfanın renk dengesini bozmasın diye
// afişler gri tonlu durur; üstüne gelince renklenir ve öne çıkar. Şeridin üstüne gelince durur.

const tilts = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2"];

export function PosterWall({ events }: { events: Event[] }) {
  const withCover = events.filter((e) => e.coverUrl);

  return (
    <div className="group/wall overflow-hidden py-8">
      <div className="flex w-max animate-marquee-slow gap-4 group-hover/wall:[animation-play-state:paused]">
        {/* sonsuz döngü için iki kez basılır; ikinci kopya erişilebilirlik ağacından gizli */}
        {[0, 1].map((copy) =>
          withCover.map((event, i) => (
            <Link
              key={`${copy}-${event.id}`}
              href={`/etkinlikler/${event.slug}`}
              aria-hidden={copy === 1 || undefined}
              tabIndex={copy === 1 ? -1 : undefined}
              title={event.title}
              className={`group/poster block w-28 shrink-0 rounded-lg border-2 border-border-strong bg-surface p-1.5 shadow-sticker-sm transition duration-300 hover:z-10 hover:-translate-y-2 hover:rotate-0 hover:shadow-sticker sm:w-32 ${tilts[i % tilts.length]}`}
            >
              <span className="relative block aspect-square overflow-hidden rounded-md bg-surface-2">
                <Image
                  src={event.coverUrl!}
                  alt=""
                  fill
                  sizes="8rem"
                  className="object-cover grayscale transition duration-300 group-hover/poster:grayscale-0"
                />
              </span>
              <span className="mt-1.5 block truncate px-0.5 font-mono text-[10px] text-fg-subtle">
                {formatMonth(event.startsAt)}
              </span>
            </Link>
          )),
        )}
      </div>
    </div>
  );
}
