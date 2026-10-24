import type { Metadata } from "next";
import { Asterisk, Braces, Circles } from "@/components/brand/brand-shapes";
import { ReleaseCard } from "@/components/events/release-card";
import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { TypingTerminal } from "@/components/ui/typing-terminal";
import { getSite } from "@/lib/content";
import { getEventTimeline } from "@/lib/events";
import { EventArchive, type ArchiveEvent } from "./_components/event-archive";
import { PosterDeck } from "./_components/poster-deck";
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
      <ScrollProgress />

      <section className="relative overflow-hidden">
        <Asterisk
          aria-hidden
          className="absolute top-16 left-[46%] hidden h-10 w-10 animate-spin-slow text-fg lg:block"
        />
        <Circles
          aria-hidden
          className="absolute bottom-6 left-[40%] hidden h-9 w-auto animate-float text-ink-black lg:block"
        />

        <div className="relative mx-auto grid max-w-content gap-12 px-4 pt-12 pb-4 sm:px-6 md:pt-20 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div className="space-y-6">
            <p className="font-mono text-sm text-fg-subtle">
              <Braces>releases</Braces>
            </p>
            <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">Etkinlikler</h1>
            <p className="max-w-xl text-lg text-fg-muted">
              <span className="inline-block rounded-lg border-2 border-border-strong bg-blue-soft px-2 font-mono font-bold text-fg">
                <CountUp to={past.length} />
              </span>{" "}
              etkinlik arşivde. Her biri bir sürüm notu gibi: ne zaman, nerede, ne konuştuk.
            </p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="#arsiv" tone="blue">
                Arşive göz at
              </ButtonLink>
              <RandomEventButton slugs={past.map((e) => e.slug)} />
            </div>
          </div>
          <PosterDeck events={past} />
        </div>
      </section>

      <PosterWall events={past} />

      <Section id="yaklasan" label="01 — yaklaşan" title="Sıradaki sürüm" className="pt-8 md:pt-10">
        {upcoming.length > 0 ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((event) => (
              <li key={event.id}>
                <ReleaseCard event={event} />
              </li>
            ))}
          </ul>
        ) : (
          <Reveal>
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
          </Reveal>
        )}
      </Section>

      <Section
        id="arsiv"
        label="02 — git log --graph"
        title="Arşiv"
        intro="Odak alanına, biçime ya da isme göre süz; bir kayda tıklayınca detayı açılır."
        className="pt-0"
      >
        <EventArchive events={archive} />
      </Section>
    </>
  );
}
