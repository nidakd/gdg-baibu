import type { Metadata } from "next";
import Link from "next/link";
import { ContactSection } from "@/components/sections/contact-section";
import { FocusAreas } from "@/components/sections/focus-areas";
import { AboutHero } from "./_components/about-hero";
import { Milestones } from "@/components/sections/milestones";
import { StatsGrid } from "@/components/sections/stats-grid";
import { Avatar } from "@/components/team/avatar";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { WaveBand } from "@/components/ui/wave-band";
import { getMembersByTeam, getTeams, getWorkingTeams } from "@/lib/content";
import { getEventsPerYear } from "@/lib/insights";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description:
    "GDG on Campus Abant İzzet Baysal University kimdir, ne yapar, hangi ekiplerden oluşur.",
};

export default function AboutPage() {
  const years = getEventsPerYear();
  const maxYear = Math.max(...years.map((y) => y.count));

  return (
    <>
      <div className="mx-auto max-w-content px-4 pt-12 sm:px-6 md:pt-20">
        <AboutHero />
      </div>

      <div className="mx-auto max-w-content px-4 pt-16 sm:px-6">
        <StatsGrid />
      </div>

      <Section label="01 — ne yapıyoruz" title="Odak alanlarımız">
        <FocusAreas />
      </Section>

      <WaveBand tone="yellow">
        <Section className="py-8 md:py-10" label="02 — yolculuk" title="Kilometre taşlarımız">
          <Milestones />
        </Section>
      </WaveBand>

      <Section
        label="03 — ekipler"
        title={`Core team'imiz ${getWorkingTeams().length} ekipten oluşuyor`}
        action={
          <ButtonLink href="/ekip" tone="green">
            Ekibi tanı
          </ButtonLink>
        }
      >
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {getTeams().map((team) => {
            const members = getMembersByTeam(team.id);
            return (
              <li key={team.id}>
                <Card tone={team.tone} className="flex h-full flex-col gap-3 p-6">
                  <p className="font-mono text-xs text-fg-subtle">
                    team/{team.id}/ · {members.length} kişi
                  </p>
                  <h3 className="text-xl font-bold">{team.name}</h3>
                  <p className="-mt-2 font-mono text-xs text-fg-subtle">{team.nameEn}</p>
                  <p className="text-fg-muted">{team.description}</p>
                  <Link
                    href={`/ekip#${team.id}`}
                    className="mt-auto flex -space-x-3 pt-2"
                    aria-label={`${team.name} üyeleri`}
                  >
                    {members.map((m) => (
                      <Avatar key={m.slug} name={m.name} photoUrl={m.photoUrl} size={40} />
                    ))}
                  </Link>
                </Card>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section
        label="04 — git log --since=2024"
        title="Her yıl daha fazla etkinlik"
        intro="GDG Community sayfamızdaki etkinliklerin yıllara göre dağılımı."
        className="pt-0"
      >
        <ul className="space-y-3 font-mono text-sm">
          {years.map(({ year, count }) => (
            <li key={year} className="grid grid-cols-[3.5rem_1fr] items-center gap-4">
              <span>{year}</span>
              <span className="flex items-center gap-3">
                <span
                  className="h-7 rounded-full border-2 border-ink-black bg-green"
                  style={{ width: `${(count / maxYear) * 100}%` }}
                />
                <span className="shrink-0 text-fg-muted">{count}</span>
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <ContactSection label="05 — iletişim" className="pt-0" />
    </>
  );
}
