import type { Metadata } from "next";
import { ReleaseCard } from "@/components/events/release-card";
import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RandomLinkButton } from "@/components/ui/random-link-button";
import { Section } from "@/components/ui/section";
import { TypingTerminal } from "@/components/ui/typing-terminal";
import { StatTile } from "@/components/ui/stat-tile";
import { WaveBand } from "@/components/ui/wave-band";
import { getSite } from "@/lib/content";
import { getEventTimeline } from "@/lib/events";
import { EventArchive, type ArchiveEvent } from "./_components/event-archive";
import { FeaturedRelease } from "./_components/featured-release";
import { PosterWall } from "./_components/poster-wall";
import { openGraph } from "@/lib/seo";

const description =
  "GDG on Campus Abant İzzet Baysal University'nin yaklaşan ve geçmiş etkinlikleri: atölyeler, kariyer buluşmaları, hackathon'lar.";

export const metadata: Metadata = {
  title: "Etkinlikler",
  description,
  openGraph: openGraph({ title: "Etkinlikler", description, path: "/etkinlikler" }),
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

  const stats = [
    { value: past.length, label: "etkinlik", tone: "green" as const },
    {
      value: past.filter((e) => e.tags.includes("Workshop / hands-on session")).length,
      label: "atölye",
      tone: "yellow" as const,
    },
    {
      value: new Set(past.map((e) => e.startsAt.slice(0, 4))).size,
      label: "yıl",
      tone: "blue" as const,
    },
  ];

  return (
    <>
      <section className="mx-auto grid max-w-content gap-14 px-4 pt-12 pb-10 sm:px-6 md:pt-20 lg:grid-cols-[1.15fr_1fr] lg:items-center">
        <div className="space-y-7">
          <p className="font-mono text-sm text-fg-subtle">{"// releases"}</p>
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">Etkinlikler</h1>
          <p className="max-w-xl text-lg text-fg-muted">
            Atölyeler, kariyer buluşmaları, hackathon&apos;lar ve kahve sohbetleri. Her etkinlik bir
            sürüm notu gibi: ne zaman, nerede, ne konuştuk.
          </p>
          <dl className="grid max-w-md grid-cols-3 gap-3">
            {stats.map((s) => (
              <StatTile
                key={s.label}
                label={s.label}
                value={<CountUp to={s.value} />}
                tone={s.tone}
                size="sm"
              />
            ))}
          </dl>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="#arsiv" tone="blue">
              Arşive göz at
            </ButtonLink>
            <RandomLinkButton
              hrefs={past.map((e) => `/etkinlikler/${e.slug}`)}
              label="Rastgele bir etkinlik"
            />
          </div>
        </div>
        {past[0] && <FeaturedRelease event={past[0]} />}
      </section>

      <WaveBand tone="blue">
        <PosterWall events={past.slice(1)} />
      </WaveBand>

      <Section label="01 — yaklaşan" title="Sıradaki sürüm">
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
