import type { Metadata } from "next";
import { MemberCard } from "@/components/team/member-card";
import { ButtonLink } from "@/components/ui/button";
import { getMembers, getMembersByTeam, getSite, getTeams } from "@/lib/content";

export const metadata: Metadata = {
  title: "Ekip",
  description: "GDG on Campus Abant İzzet Baysal University core team üyeleri ve ekipleri.",
};

export default function TeamPage() {
  const site = getSite();
  const teams = getTeams();

  return (
    <div className="mx-auto max-w-content px-4 py-12 sm:px-6 md:py-20">
      <header className="max-w-2xl space-y-4">
        <p className="font-mono text-sm text-fg-subtle">{"// contributors.json"}</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Ekibimiz</h1>
        <p className="text-lg text-fg-muted">
          {getMembers().length} kişi, {teams.length} ekip. Etkinlikleri planlayan, afişleri
          tasarlayan, atölyeleri hazırlayan ve sponsorları bulan insanlar.
        </p>
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-[14rem_1fr]">
        <nav aria-label="Ekipler" className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-3 font-mono text-xs text-fg-subtle">team/</p>
          <ul className="space-y-1 font-mono text-sm">
            {teams.map((team) => (
              <li key={team.id}>
                <a
                  href={`#${team.id}`}
                  className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-surface"
                >
                  <span>
                    <span aria-hidden className="text-fg-subtle">
                      ├─{" "}
                    </span>
                    {team.id}/
                  </span>
                  <span className="text-fg-subtle">{getMembersByTeam(team.id).length}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-14">
          {teams.map((team) => (
            <section key={team.id} id={team.id} className="scroll-mt-24">
              <div className="mb-5 space-y-1">
                <h2 className="text-2xl font-bold">{team.name}</h2>
                <p className="text-fg-muted">{team.description}</p>
              </div>
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {getMembersByTeam(team.id).map((member) => (
                  <li key={member.slug}>
                    <MemberCard member={member} />
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section className="rounded-card border-2 border-dashed border-border-strong p-6 md:p-8">
            <p className="font-mono text-sm text-fg-subtle">{'{ "you": null }'}</p>
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
          </section>
        </div>
      </div>
    </div>
  );
}
