import Image from "next/image";
import Link from "next/link";
import type { Event } from "@/lib/content";
import { formatMonth } from "@/lib/format";

// İki sıra halinde, zıt yönlere kayan etkinlik afişleri. Üstüne gelince durur.

const tilts = ["-rotate-3", "rotate-2", "-rotate-1", "rotate-3", "rotate-1", "-rotate-2"];

export function PosterWall({ events }: { events: Event[] }) {
  const withCover = events.filter((e) => e.coverUrl);
  const half = Math.ceil(withCover.length / 2);
  const rows = [withCover.slice(0, half), withCover.slice(half)];

  return (
    <div className="group/wall space-y-6 overflow-hidden py-6">
      {rows.map((row, r) => (
        <div
          key={r}
          className={`flex w-max gap-6 ${r === 0 ? "animate-marquee-slow" : "animate-marquee-slow-reverse"} group-hover/wall:[animation-play-state:paused]`}
        >
          {/* sonsuz döngü için satır iki kez basılır; ikinci kopya erişilebilirlik ağacından gizli */}
          {[0, 1].map((copy) =>
            row.map((event, i) => (
              <Link
                key={`${copy}-${event.id}`}
                href={`/etkinlikler/${event.slug}`}
                aria-hidden={copy === 1 || undefined}
                tabIndex={copy === 1 ? -1 : undefined}
                className={`block w-40 shrink-0 rounded-lg border-2 border-border-strong bg-surface p-2 pb-3 shadow-sticker transition duration-300 hover:z-10 hover:scale-110 hover:rotate-0 sm:w-48 ${tilts[(i + r) % tilts.length]}`}
              >
                <span className="relative block aspect-square overflow-hidden rounded-md bg-surface-2">
                  <Image src={event.coverUrl!} alt="" fill sizes="12rem" className="object-cover" />
                </span>
                <span className="mt-2 block truncate text-sm font-bold">{event.title}</span>
                <span className="block font-mono text-[11px] text-fg-subtle">
                  {formatMonth(event.startsAt)}
                </span>
              </Link>
            )),
          )}
        </div>
      ))}
    </div>
  );
}
