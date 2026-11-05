import Link from "next/link";
import { Poster } from "@/components/events/poster";
import type { Event } from "@/lib/content";
import { formatDate } from "@/lib/format";

/** Sıradaki etkinliğin kartı: koyu zemin, mavi bant üstünde afişi öne çıkarır. */
function NextCard({ event }: { event: Event }) {
  return (
    <Link
      href={`/etkinlikler/${event.slug}`}
      className="group flex shrink-0 flex-col overflow-hidden rounded-card border-[3px] border-ink-black bg-ink-black text-off-white shadow-sticker transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-sticker-lg md:w-64"
    >
      <span className="relative block aspect-[4/3] overflow-hidden border-b-[3px] border-ink-black bg-surface-2">
        {event.coverUrl && (
          <Poster
            src={event.coverUrl}
            aspect={event.coverAspect}
            box={4 / 3}
            alt=""
            sizes="16rem"
          />
        )}
      </span>
      <span className="block p-4">
        <span className="font-mono text-xs">sıradaki · {formatDate(event.startsAt)}</span>
        <span className="mt-1 block text-lg font-bold group-hover:underline">{event.title}</span>
      </span>
    </Link>
  );
}

/** Ana sayfa etkinlik bölümü: solda sıradaki, sağda yana kayan küçük afiş kartları. */
export function LatestEvents({ next, past }: { next?: Event; past: Event[] }) {
  return (
    <div className="flex flex-col gap-5 md:flex-row">
      {next && <NextCard event={next} />}
      <ul className="-mx-4 flex min-w-0 flex-1 gap-4 overflow-x-auto px-4 pb-3 md:mx-0 md:px-0">
        {past.slice(0, 8).map((e) => (
          <li key={e.id} className="w-40 shrink-0">
            <Link
              href={`/etkinlikler/${e.slug}`}
              className="group block overflow-hidden rounded-xl border-2 border-border-strong bg-surface shadow-sticker-sm transition hover:-translate-y-1 hover:shadow-sticker"
            >
              <span className="relative block aspect-square overflow-hidden border-b-2 border-border-strong bg-surface-2">
                {e.coverUrl && (
                  <Poster src={e.coverUrl} aspect={e.coverAspect} alt="" sizes="10rem" />
                )}
              </span>
              <span className="block px-3 py-2">
                <span className="block truncate text-sm font-bold group-hover:underline">
                  {e.title}
                </span>
                <span className="block font-mono text-[11px] text-fg-subtle">
                  {formatDate(e.startsAt)}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
