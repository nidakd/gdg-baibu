import Link from "next/link";
import { Poster } from "@/components/events/poster";
import type { Event } from "@/lib/content";
import { formatMonth } from "@/lib/format";

// Tek sıra halinde kayan etkinlik afişleri: hepsi aynı boyutta, düz ve aynı çerçevede.
// Kenarlarda yumuşakça kaybolur; üstüne gelince durur.

export function PosterWall({ events }: { events: Event[] }) {
  const withCover = events.filter((e) => e.coverUrl);

  return (
    <div
      className="group/wall overflow-hidden py-4"
      style={{
        maskImage: "linear-gradient(90deg, transparent, black 6%, black 94%, transparent)",
      }}
    >
      <div className="flex w-max animate-marquee-slow gap-5 group-hover/wall:[animation-play-state:paused]">
        {/* sonsuz döngü için iki kez basılır; ikinci kopya erişilebilirlik ağacından gizli */}
        {[0, 1].map((copy) =>
          withCover.map((event) => (
            <Link
              key={`${copy}-${event.id}`}
              href={`/etkinlikler/${event.slug}`}
              aria-hidden={copy === 1 || undefined}
              tabIndex={copy === 1 ? -1 : undefined}
              className="group/poster block w-36 shrink-0 overflow-hidden rounded-xl border-2 border-border-strong bg-surface shadow-sticker-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-sticker"
            >
              <span className="relative block aspect-square overflow-hidden border-b-2 border-border-strong bg-surface-2">
                <Poster src={event.coverUrl!} aspect={event.coverAspect} alt="" sizes="9rem" />
              </span>
              <span className="block px-2.5 py-2">
                <span className="block truncate text-xs font-bold group-hover/poster:underline">
                  {event.title}
                </span>
                <span className="block font-mono text-[10px] text-fg-subtle">
                  {formatMonth(event.startsAt)}
                </span>
              </span>
            </Link>
          )),
        )}
      </div>
    </div>
  );
}
