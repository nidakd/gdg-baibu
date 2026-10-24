import Image from "next/image";
import Link from "next/link";
import type { Event } from "@/lib/content";
import { releaseTag } from "@/lib/format";

// Son üç etkinliğin afişi, iskambil destesi gibi üst üste. Üstüne gelince yelpaze gibi açılır.

const fan = [
  "z-0 -translate-x-6 -rotate-6 group-hover:-translate-x-28 group-hover:-rotate-12",
  "z-[1] group-hover:-translate-y-3",
  "z-[2] translate-x-6 rotate-6 group-hover:translate-x-28 group-hover:rotate-12",
];

export function PosterDeck({ events }: { events: Event[] }) {
  const cards = events
    .filter((e) => e.coverUrl)
    .slice(0, 3)
    .reverse();

  return (
    <div className="group relative mx-auto h-60 w-44 sm:h-80 sm:w-64">
      {cards.map((event, i) => (
        <Link
          key={event.id}
          href={`/etkinlikler/${event.slug}`}
          className={`absolute inset-0 block rounded-card border-2 border-border-strong bg-surface p-2.5 pb-10 shadow-sticker transition duration-500 ease-out hover:z-10 ${fan[i]}`}
        >
          <span className="relative block h-full overflow-hidden rounded-xl bg-surface-2">
            <Image
              src={event.coverUrl!}
              alt={`${event.title} afişi`}
              fill
              sizes="16rem"
              className="object-cover"
            />
          </span>
          <span className="absolute inset-x-3 bottom-2.5 flex items-center justify-between gap-2 font-mono text-xs">
            <span className="truncate font-bold">{event.title}</span>
            <span className="shrink-0 text-green-ink">{releaseTag(event.startsAt)}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}
