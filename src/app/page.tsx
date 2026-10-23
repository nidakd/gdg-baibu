import Link from "next/link";
import { PillShapes } from "@/components/brand/pill-shapes";
import { ReleaseCard } from "@/components/events/release-card";
import { FocusAreas } from "@/components/sections/focus-areas";
import { StatsGrid } from "@/components/sections/stats-grid";
import { Avatar } from "@/components/team/avatar";
import { ButtonLink } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { Cursor, Prompt, Terminal } from "@/components/ui/terminal";
import { getEvents, getMembers, getSite, getTeams } from "@/lib/content";

export default function Home() {
  const site = getSite();
  const members = getMembers();
  const latest = getEvents().slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden border-b-2 border-border-strong">
        <PillShapes className="hidden lg:block" />
        <div className="relative mx-auto grid max-w-content gap-12 px-4 py-16 sm:px-6 md:py-28 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div className="space-y-6">
            <p className="font-mono text-sm text-fg-subtle">{"// gdg init --campus aibu"}</p>
            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-6xl">
              Birlikte öğreniyor, <span className="text-blue-ink">birlikte üretiyoruz.</span>
            </h1>
            <p className="max-w-xl text-lg text-fg-muted">{site.about.intro}</p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={site.links.coreTeamForm} tone="yellow">
                Aramıza katıl
              </ButtonLink>
              <ButtonLink href="/ekip" tone="plain">
                Ekibi tanı
              </ButtonLink>
            </div>
          </div>

          <Terminal>
            <Prompt>gdg status</Prompt>
            <p>
              <span className="text-green-ink">✓</span> {members.length} core team üyesi,{" "}
              {getTeams().length} ekip
            </p>
            <p>
              <span className="text-green-ink">✓</span> {getEvents().length} etkinlik arşivde
            </p>
            <p>
              <span className="text-green-ink">✓</span> son etkinlik:{" "}
              <span className="text-syntax-string">&quot;{latest[0]?.title}&quot;</span>
            </p>
            <Prompt>
              gdg join <span className="text-syntax-keyword">--you</span>
              <Cursor />
            </Prompt>
          </Terminal>
        </div>
      </section>

      <div className="mx-auto max-w-content px-4 pt-16 sm:px-6">
        <StatsGrid />
      </div>

      <Section
        label="01 — ne yapıyoruz"
        title="Etkinliklerimizin çoğu bu altı başlıktan birine giriyor"
        intro="Sayılar GDG Community'deki etkinlik arşivimizden; bir etkinlik birden fazla başlıkta yer alabilir."
        action={
          <ButtonLink href="/hakkimizda" tone="plain">
            Hakkımızda
          </ButtonLink>
        }
      >
        <FocusAreas />
      </Section>

      <div className="border-y-2 border-border-strong bg-blue-soft">
        <Section
          label="02 — son sürümler"
          title="Son etkinlikler"
          action={
            <ButtonLink href={site.links.gdgCommunity} tone="plain">
              Tüm etkinlikler
            </ButtonLink>
          }
        >
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((event) => (
              <li key={event.id}>
                <ReleaseCard event={event} />
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <Section
        label="03 — contributors"
        title="Bu dönemin core team'i"
        intro="Etkinlikleri planlayan, afişleri tasarlayan, atölyeleri hazırlayan ekip."
        action={
          <ButtonLink href="/ekip" tone="green">
            Tüm ekip
          </ButtonLink>
        }
      >
        <ul className="flex flex-wrap gap-3">
          {members.map((member) => (
            <li key={member.slug}>
              <Link
                href={`/ekip/${member.slug}`}
                title={`${member.name} · ${member.role}`}
                className="block rounded-full transition hover:-translate-y-1"
              >
                <Avatar name={member.name} photoUrl={member.photoUrl} size={64} />
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <div className="mx-auto max-w-content px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-card border-2 border-ink-black bg-yellow p-8 text-ink-black shadow-sticker-lg md:p-12">
          <p className="font-mono text-sm">{"// 04 — deploy yourself"}</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Deneyim şart değil. Merak yeter.
          </h2>
          <ol className="mt-8 grid gap-4 font-mono text-sm md:grid-cols-3">
            {[
              ["git clone", "WhatsApp grubuna katıl, duyuruları ilk sen gör."],
              ["npm install", "Bir etkinliğe gel, ekiple tanış."],
              ["deploy", "Core team başvurusunu doldur, bir ekibe katıl."],
            ].map(([cmd, text], i) => (
              <li key={cmd} className="rounded-xl border-2 border-ink-black bg-off-white p-4">
                <span className="font-bold">
                  {i + 1}. $ {cmd}
                </span>
                <p className="mt-2 font-sans text-base">{text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={site.links.whatsapp} tone="green">
              WhatsApp grubu
            </ButtonLink>
            <ButtonLink href={site.links.coreTeamForm} tone="blue">
              Core team başvurusu
            </ButtonLink>
          </div>
        </div>
      </div>
    </>
  );
}
