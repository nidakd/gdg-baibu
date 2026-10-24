import type { Metadata } from "next";
import { Arrow, Asterisk, Braces, Circles, Globe } from "@/components/brand/brand-shapes";
import { ReleaseCard } from "@/components/events/release-card";
import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TypingTerminal } from "@/components/ui/typing-terminal";
import { getSite } from "@/lib/content";
import { getEventTimeline } from "@/lib/events";
import { EventArchive, type ArchiveEvent } from "./_components/event-archive";
import { PosterWall } from "./_components/poster-wall";
import { RandomEventButton } from "./_components/random-event-button";

export const metadata: Metadata = {
  title: "Etkinlikler",
  description:
    "GDG on Campus Abant İzzet Baysal University'nin yaklaşan ve geçmiş etkinlikleri: atölyeler, kariyer buluşmaları, hackathon'lar.",
};

export default async function EventsPage() {
  const site = getSite();
  const { upcoming, past } = await getEventTimeline();
  const archive: ArchiveEvent[] = past.map((e) => ({
    id: e.id,
    slug: e.slug,
    title: e.title,
    startsAt: e.startsAt,
    venue: e.venue,
    format: e.format,
    tags: e.tags,
    coverUrl: e.coverUrl,
  }));

  return (
    <>
      <div className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden md:block [&>*]:absolute"
        >
          <Globe className="top-14 right-[8%] h-24 w-24 animate-float text-ink-black" />
          <Asterisk className="top-56 right-[28%] h-10 w-10 animate-spin-slow text-fg" />
          <Circles className="right-[6%] bottom-10 h-10 w-auto animate-float text-ink-black [animation-delay:-3s]" />
          <Arrow className="right-[22%] bottom-16 h-8 w-auto text-fg" />
        </div>

        <header className="relative mx-auto max-w-content space-y-6 px-4 pt-12 sm:px-6 md:pt-20">
          <p className="font-mono text-sm text-fg-subtle">
            <Braces>releases</Braces>
          </p>
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">Etkinlikler</h1>
          <p className="max-w-xl text-lg text-fg-muted">
            <span className="inline-block rounded-lg border-2 border-ink-black bg-green-halftone px-2 font-mono font-bold text-ink-black shadow-sticker-sm">
              <CountUp to={past.length} />
            </span>{" "}
            etkinlik arşivde. Her biri bir sürüm notu gibi: ne zaman, nerede, ne konuştuk.
          </p>
          <RandomEventButton slugs={past.map((e) => e.slug)} />
        </header>
      </div>

      <PosterWall events={past} />

      <div className="mx-auto max-w-content px-4 pb-12 sm:px-6 md:pb-20">
        <section aria-labelledby="yaklasan" className="mt-10">
          <h2 id="yaklasan" className="mb-6 text-2xl font-bold">
            Yaklaşan
          </h2>
          {upcoming.length > 0 ? (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((event) => (
                <li key={event.id}>
                  <ReleaseCard event={event} />
                </li>
              ))}
            </ul>
          ) : (
            <Card
              tone="yellow"
              className="grid gap-6 p-6 md:grid-cols-[1fr_1.1fr] md:items-center md:p-8"
            >
              <div className="space-y-3">
                <p className="text-2xl font-bold">Şu an duyurulmuş bir etkinlik yok</p>
                <p className="text-fg-muted">
                  Yeni etkinlikler ilk WhatsApp grubunda ve Instagram&apos;da duyuruluyor.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <ButtonLink href={site.links.whatsapp} tone="green">
                    WhatsApp grubu
                  </ButtonLink>
                  <ButtonLink href={site.links.instagram} tone="plain">
                    Instagram
                  </ButtonLink>
                </div>
              </div>
              <TypingTerminal
                lines={[
                  { kind: "command", text: "gdg events --upcoming" },
                  { kind: "info", text: "0 sonuç. Bir sonraki sürüm hazırlanıyor…" },
                  { kind: "command", text: "gdg notify --whatsapp" },
                ]}
              />
            </Card>
          )}
        </section>

        <section aria-labelledby="arsiv" className="mt-20">
          <div className="mb-6 space-y-2">
            <p className="font-mono text-sm text-fg-subtle">{"// git log --graph"}</p>
            <h2 id="arsiv" className="text-2xl font-bold">
              Arşiv
            </h2>
          </div>
          <Reveal>
            <EventArchive events={archive} />
          </Reveal>
        </section>
      </div>
    </>
  );
}
