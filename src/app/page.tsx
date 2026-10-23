import { Cursor, Prompt, Terminal } from "@/components/terminal";
import { getEvents, getMembers, getSite, getTeams } from "@/lib/content";

export default function Home() {
  const site = getSite();
  const lines = [
    `${getMembers().length} core team üyesi, ${getTeams().length} ekip`,
    `${getEvents().length} etkinlik arşivlendi`,
    `${site.stats.communityMembers} topluluk üyesi`,
  ];

  return (
    <section className="mx-auto grid max-w-content gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.1fr_1fr] lg:items-center">
      <div className="space-y-5">
        <p className="font-mono text-sm text-fg-subtle">{"// 00 — yakında"}</p>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {site.name}
        </h1>
        <p className="max-w-prose text-lg text-fg-muted">
          Biz kimiz, ne yapıyoruz, ekibimiz ve etkinliklerimiz. Yeni sitemiz derleniyor.
        </p>
      </div>

      <Terminal>
        <Prompt>gdg init --campus aibu</Prompt>
        {lines.map((line) => (
          <p key={line}>
            <span className="text-green">✓</span> {line}
          </p>
        ))}
        <p>
          <span className="text-blue">→</span> site derleniyor
          <Cursor />
        </p>
      </Terminal>
    </section>
  );
}
