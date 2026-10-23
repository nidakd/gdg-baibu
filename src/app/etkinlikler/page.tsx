import type { Metadata } from "next";
import { ReleaseCard } from "@/components/events/release-card";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Prompt, Terminal } from "@/components/ui/terminal";
import { getSite } from "@/lib/content";
import { getEventTimeline } from "@/lib/events";
import { EventArchive, type ArchiveEvent } from "./_components/event-archive";

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
    <div className="mx-auto max-w-content px-4 py-12 sm:px-6 md:py-20">
      <header className="max-w-2xl space-y-4">
        <p className="font-mono text-sm text-fg-subtle">{"// releases"}</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">Etkinlikler</h1>
        <p className="text-lg text-fg-muted">
          {past.length} etkinlik arşivde. Her biri bir sürüm notu gibi: ne zaman, nerede, ne
          konuştuk.
        </p>
      </header>

      <section aria-labelledby="yaklasan" className="mt-14">
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
            <Terminal title="~/gdg-aibu/etkinlikler">
              <Prompt>gdg events --upcoming</Prompt>
              <p className="text-fg-muted">0 sonuç. Bir sonraki sürüm hazırlanıyor…</p>
            </Terminal>
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
  );
}
