import type { Metadata } from "next";
import Link from "next/link";
import { FocusAreas } from "@/components/sections/focus-areas";
import { StatsGrid } from "@/components/sections/stats-grid";
import { Avatar } from "@/components/team/avatar";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { getMembersByTeam, getSite, getTeams } from "@/lib/content";
import { formatMonth } from "@/lib/format";
import { getEventsPerYear, getSeries } from "@/lib/insights";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description:
    "GDG on Campus Abant İzzet Baysal University kimdir, ne yapar, hangi ekiplerden oluşur.",
};

export default function AboutPage() {
  const site = getSite();
  const years = getEventsPerYear();
  const maxYear = Math.max(...years.map((y) => y.count));

  return (
    <>
      <div className="mx-auto max-w-content px-4 pt-12 sm:px-6 md:pt-20">
        <Card className="overflow-hidden">
          <div className="flex items-center gap-2 border-b-2 border-border-strong bg-surface-2 px-5 py-3 font-mono text-sm">
            <span aria-hidden className="text-fg-subtle">
              ▤
            </span>
            README.md
          </div>
          <div className="space-y-5 p-6 md:p-10">
            <p className="font-mono text-sm text-fg-subtle"># biz kimiz?</p>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl">
              {site.about.intro}
            </h1>
            {site.about.paragraphs.map((p) => (
              <p key={p} className="max-w-3xl text-lg text-fg-muted">
                {p}
              </p>
            ))}
          </div>
        </Card>
      </div>

      <div className="mx-auto max-w-content px-4 pt-12 sm:px-6">
        <StatsGrid />
      </div>

      <Section label="01 — ne yapıyoruz" title="Odak alanlarımız">
        <FocusAreas />
      </Section>

      <div className="border-y-2 border-border-strong bg-yellow-soft">
        <Section
          label="02 — seriler"
          title="Tekrar eden etkinliklerimiz"
          intro="Bir kere yapıp bırakmadığımız, birden fazla oturuma yayılan etkinlikler."
        >
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {getSeries().map((series) => (
              <li key={series.id}>
                <Card className="flex h-full flex-col gap-2 p-5">
                  <p className="font-mono text-xs text-fg-subtle">{series.events.length} oturum</p>
                  <h3 className="text-xl font-bold">{series.title}</h3>
                  <p className="mt-auto text-sm text-fg-muted">
                    {formatMonth(series.first) === formatMonth(series.last)
                      ? formatMonth(series.first)
                      : `${formatMonth(series.first)} – ${formatMonth(series.last)}`}
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <Section
        label="03 — ekipler"
        title="Core team altı ekipten oluşuyor"
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
    </>
  );
}
