import type { Metadata } from "next";
import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import { MemberCard } from "@/components/team/member-card";
import { ButtonLink } from "@/components/ui/button";
import { RandomLinkButton } from "@/components/ui/random-link-button";
import { Cursor } from "@/components/ui/terminal";
import { Window } from "@/components/ui/window";
import { getMembers, getMembersByTeam, getSite, getTeams, getWorkingTeams } from "@/lib/content";
import { AvatarCloud } from "./_components/avatar-cloud";
import { TeamNav } from "./_components/team-nav";

export const metadata: Metadata = {
  title: "Ekip",
  description: "GDG on Campus Abant İzzet Baysal University core team üyeleri ve ekipleri.",
};

export default function TeamPage() {
  const site = getSite();
  const teams = getTeams();
  const members = getMembers();

  const stats = [
    { value: members.length, label: "kişi", className: "bg-blue-halftone" },
    { value: getWorkingTeams().length, label: "ekip", className: "bg-green-halftone" },
    {
      value: members.filter((m) => m.role === "Koordinatör").length,
      label: "koordinatör",
      className: "bg-red-halftone",
    },
  ];

  return (
    <div className="mx-auto max-w-content px-4 py-12 sm:px-6 md:py-20">
      <header className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div className="space-y-6">
          <p className="font-mono text-sm text-fg-subtle">{"// contributors.json"}</p>
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">Ekibimiz</h1>
          <p className="max-w-xl text-lg text-fg-muted">
            Etkinlikleri planlayan, afişleri tasarlayan, atölyeleri hazırlayan ve sponsorları bulan
            insanlar. Birine tıkla, tanış.
          </p>
          <dl className="grid max-w-md grid-cols-3 gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className={`rounded-xl border-2 border-ink-black px-3 py-2.5 text-ink-black shadow-sticker-sm ${s.className}`}
              >
                <dt className="font-mono text-[11px]">{s.label}</dt>
                <dd className="text-3xl font-bold tracking-tight">
                  <CountUp to={s.value} />
                </dd>
              </div>
            ))}
          </dl>
          <RandomLinkButton
            hrefs={members.map((m) => `/ekip/${m.slug}`)}
            label="Rastgele biriyle tanış"
          />
        </div>
        <AvatarCloud members={members} />
      </header>

      <div className="mt-16 grid gap-10 lg:grid-cols-[14rem_1fr]">
        <TeamNav
          teams={teams.map((t) => ({
            id: t.id,
            tone: t.tone,
            count: getMembersByTeam(t.id).length,
          }))}
        />

        <div className="space-y-10">
          {teams.map((team) => {
            const teamMembers = getMembersByTeam(team.id);
            return (
              <section
                key={team.id}
                id={team.id}
                aria-labelledby={`${team.id}-baslik`}
                className="scroll-mt-24"
              >
                <Reveal>
                  <Window
                    title={`~/team/${team.id}`}
                    meta={`${teamMembers.length} kişi`}
                    tone={team.tone}
                    sticky
                  >
                    <div className="space-y-5 p-5 sm:p-6">
                      <div className="space-y-1">
                        <h2 id={`${team.id}-baslik`} className="text-2xl font-bold">
                          {team.name}
                        </h2>
                        <p className="font-mono text-xs text-fg-subtle">{team.nameEn}</p>
                        <p className="text-fg-muted">{team.description}</p>
                      </div>
                      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {teamMembers.map((member, i) => (
                          <li key={member.slug}>
                            <Reveal delay={i * 80} className="h-full">
                              <MemberCard member={member} showTeam={false} />
                            </Reveal>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Window>
                </Reveal>
              </section>
            );
          })}

          <Reveal>
            <section className="flex flex-col gap-6 rounded-card border-2 border-dashed border-border-strong p-6 sm:flex-row sm:items-center md:p-8">
              <span aria-hidden className="relative grid size-24 shrink-0 place-items-center">
                <span className="absolute inset-0 animate-ping rounded-full border-2 border-dashed border-blue opacity-40" />
                <span className="grid size-24 place-items-center rounded-full border-2 border-dashed border-border-strong bg-surface font-mono text-3xl font-bold text-fg-subtle">
                  ?
                </span>
              </span>
              <div>
                <p className="font-mono text-sm text-fg-subtle">
                  {'{ "you": '}
                  <span className="text-syntax-keyword">null</span>
                  <Cursor />
                  {" }"}
                </p>
                <h2 className="mt-2 text-2xl font-bold">Listenin sonunda senin için yer var</h2>
                <p className="mt-2 max-w-xl text-fg-muted">
                  Core team başvuruları açıkken formu doldur; hangi ekipte olmak istediğini birlikte
                  konuşalım.
                </p>
                <div className="mt-5">
                  <ButtonLink href={site.links.coreTeamForm} tone="yellow">
                    Core team başvurusu
                  </ButtonLink>
                </div>
              </div>
            </section>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
