import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Poster } from "@/components/events/poster";
import { Avatar } from "@/components/team/avatar";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { getEventBySlug, type Event } from "@/lib/content";
import { getAdjacentEvents, getEventTimeline, sanitizeDescription } from "@/lib/events";
import { formatDate, formatDateLong, formatTimeRange, releaseTag } from "@/lib/format";
import { getSeriesOf } from "@/lib/insights";

export async function EventDetail({ params }: Pick<PageProps<"/etkinlikler/[slug]">, "params">) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();

  const { upcoming } = await getEventTimeline();
  const isUpcoming = upcoming.some((e) => e.id === event.id);
  const series = getSeriesOf(event);
  const siblings = series?.events.filter((e) => e.id !== event.id) ?? [];
  const { older, newer } = getAdjacentEvents(event.slug);
  // Çok uzun ya da çok yatay afiş sayfayı bozmasın
  const posterBox = Math.min(Math.max(event.coverAspect ?? 1, 0.7), 1.6);

  return (
    <>
      <div className="mt-8 grid gap-10 lg:grid-cols-[22rem_1fr] lg:items-start">
        <div className="space-y-6 lg:sticky lg:top-24">
          {event.coverUrl && (
            // Detayda afiş kırpılmadan, kendi oranında görünür
            <div
              className="relative overflow-hidden rounded-card border-[3px] border-border-strong bg-surface-2 shadow-sticker-lg"
              style={{ aspectRatio: posterBox }}
            >
              <Poster
                src={event.coverUrl}
                aspect={event.coverAspect}
                box={posterBox}
                alt={`${event.title} afişi`}
                priority
                sizes="(min-width: 1024px) 22rem, 100vw"
              />
            </div>
          )}
          <Card className="space-y-3 p-5 text-sm">
            <Info label="tarih">{formatDateLong(event.startsAt)}</Info>
            <Info label="saat">{formatTimeRange(event.startsAt, event.endsAt)}</Info>
            <Info label="yer">{event.format === "online" ? "Online" : (event.venue ?? "—")}</Info>
            <div className="flex flex-wrap gap-3 pt-2">
              <ButtonLink href={event.sourceUrl} tone={isUpcoming ? "yellow" : "plain"}>
                {isUpcoming ? "Kayıt ol" : "GDG Community sayfası"}
              </ButtonLink>
            </div>
          </Card>
        </div>

        <article className="min-w-0 space-y-8">
          <header className="space-y-4">
            <p className="flex flex-wrap items-center gap-2 font-mono text-sm text-fg-subtle">
              <span className="text-green-ink">{releaseTag(event.startsAt)}</span>·
              <span>{formatDate(event.startsAt)}</span>
              <span
                className={`rounded-full border-2 border-ink-black px-2.5 py-0.5 text-xs text-ink-black ${
                  isUpcoming ? "bg-yellow" : "bg-green-pastel"
                }`}
              >
                {isUpcoming ? "yaklaşan" : "tamamlandı"}
              </span>
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
              {event.title}
            </h1>
            {event.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <Tag>{event.format === "online" ? "online" : "yüz yüze"}</Tag>
                {event.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            )}
          </header>

          {event.descriptionHtml ? (
            <div
              className="prose-gdg max-w-prose"
              dangerouslySetInnerHTML={{ __html: sanitizeDescription(event.descriptionHtml) }}
            />
          ) : (
            event.summary && <p className="max-w-prose text-fg-muted">{event.summary}</p>
          )}

          {event.speakers.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Konuşmacılar</h2>
              <ul className="grid gap-4 sm:grid-cols-2">
                {event.speakers.map((s) => (
                  <li
                    key={s.name}
                    className="flex items-center gap-4 rounded-card border-2 border-border-strong bg-surface p-4 shadow-sticker-sm"
                  >
                    <Avatar name={s.name} photoUrl={s.photoUrl} size={56} />
                    <span>
                      <span className="block font-bold">{s.name}</span>
                      {(s.title || s.company) && (
                        <span className="block text-sm text-fg-muted">
                          {[s.title, s.company].filter(Boolean).join(" · ")}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {event.photos.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Fotoğraflar</h2>
              <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {event.photos.map((src, i) => (
                  <li
                    key={src}
                    className={`relative aspect-[4/3] overflow-hidden rounded-xl border-2 border-border-strong ${
                      i % 3 === 0 ? "-rotate-1" : i % 3 === 1 ? "rotate-1" : ""
                    }`}
                  >
                    <Image
                      src={src}
                      alt={`${event.title} etkinliğinden fotoğraf ${i + 1}`}
                      fill
                      sizes="(min-width: 768px) 16rem, 50vw"
                      className="object-cover"
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {series && siblings.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-bold">{series.title} serisinin diğer oturumları</h2>
              <ul className="space-y-2">
                {siblings.map((e) => (
                  <li key={e.id}>
                    <EventLink event={e} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
      </div>

      <nav
        aria-label="Diğer etkinlikler"
        className="mt-16 grid gap-4 border-t border-dashed border-border-strong pt-8 sm:grid-cols-2"
      >
        {older ? <EventLink event={older} label="← daha eski" /> : <span />}
        {newer && <EventLink event={newer} label="daha yeni →" align="right" />}
      </nav>
    </>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <p className="grid grid-cols-[3.5rem_1fr] gap-2">
      <span className="font-mono text-xs leading-5 text-fg-subtle">{label}</span>
      <span>{children}</span>
    </p>
  );
}

function EventLink({
  event,
  label,
  align = "left",
}: {
  event: Event;
  label?: string;
  align?: "left" | "right";
}) {
  return (
    <Link
      href={`/etkinlikler/${event.slug}`}
      className={`group block rounded-xl border-2 border-border bg-surface p-4 transition hover:border-border-strong ${
        align === "right" ? "sm:text-right" : ""
      }`}
    >
      <span className="block font-mono text-xs text-fg-subtle">
        {[
          align === "right" ? formatDate(event.startsAt) : label,
          align === "right" ? label : formatDate(event.startsAt),
        ]
          .filter(Boolean)
          .join(" · ")}
      </span>
      <span className="mt-1 block font-bold group-hover:underline">{event.title}</span>
    </Link>
  );
}
