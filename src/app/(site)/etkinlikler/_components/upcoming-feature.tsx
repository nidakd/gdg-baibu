import Link from "next/link";
import { Poster } from "@/components/events/poster";
import { ButtonLink } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import type { Event } from "@/lib/content";
import { formatDateLong, formatTimeRange, releaseTag } from "@/lib/format";

/**
 * Yaklaşan tek etkinlik varken: üç sütunluk ızgarada tek kart yanında boşluk bırakıyordu,
 * onun yerine afiş solda, bilgiler ve kayıt butonu sağda geniş bir kart.
 */
export function UpcomingFeature({ event }: { event: Event }) {
  return (
    <article className="grid overflow-hidden rounded-card border-2 border-border-strong bg-surface shadow-sticker md:grid-cols-[minmax(0,20rem)_1fr]">
      {event.coverUrl && (
        <Link
          href={`/etkinlikler/${event.slug}`}
          className="group relative block aspect-square overflow-hidden border-b-2 border-border-strong bg-surface-2 md:border-r-2 md:border-b-0"
        >
          <Poster
            src={event.coverUrl}
            aspect={event.coverAspect}
            alt={`${event.title} afişi`}
            sizes="(min-width: 768px) 20rem, 100vw"
            className="transition duration-500 group-hover:scale-105"
          />
        </Link>
      )}
      <div className="flex flex-col gap-5 p-6 md:p-8">
        <p className="flex flex-wrap items-center gap-2 font-mono text-sm text-fg-subtle">
          <span className="text-green-ink">{releaseTag(event.startsAt)}</span>·
          <span className="rounded-full border-2 border-ink-black bg-yellow px-2.5 py-0.5 text-xs text-ink-black">
            yaklaşan
          </span>
        </p>
        <h3 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          <Link href={`/etkinlikler/${event.slug}`} className="hover:underline">
            {event.title}
          </Link>
        </h3>
        <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
          <Info label="tarih">{formatDateLong(event.startsAt)}</Info>
          <Info label="saat">{formatTimeRange(event.startsAt, event.endsAt)}</Info>
          <Info label="yer">{event.format === "online" ? "Online" : (event.venue ?? "—")}</Info>
        </dl>
        {event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {event.tags.slice(0, 4).map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        )}
        <div className="mt-auto flex flex-wrap gap-3 pt-2">
          <ButtonLink href={`/etkinlikler/${event.slug}#kayit`} tone="yellow">
            Kayıt ol
          </ButtonLink>
          <ButtonLink href={`/etkinlikler/${event.slug}`} tone="plain">
            Detaylar
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="font-mono text-xs text-fg-subtle">{label}</dt>
      <dd className="font-medium">{children}</dd>
    </div>
  );
}
