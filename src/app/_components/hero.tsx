import type { ReactNode } from "react";
import { PillShapes } from "@/components/brand/pill-shapes";
import { ButtonLink } from "@/components/ui/button";
import { TypingTerminal, type TerminalLine } from "@/components/ui/typing-terminal";
import { getMembers, getSite, getWorkingTeams } from "@/lib/content";
import { getEventTimeline } from "@/lib/events";
import { formatDate } from "@/lib/format";

export async function Hero() {
  const site = getSite();
  const { upcoming, past } = await getEventTimeline();
  const next = upcoming[0];
  const lines: TerminalLine[] = [
    { kind: "command", text: "gdg init --campus aibu" },
    {
      kind: "ok",
      text: `${getMembers().length} core team üyesi, ${getWorkingTeams().length} ekip`,
    },
    { kind: "ok", text: `${past.length} etkinlik arşivde` },
    { kind: "info", text: `son etkinlik: "${past[0]?.title}"` },
    ...(next
      ? [
          {
            kind: "info" as const,
            text: `sıradaki: "${next.title}" · ${formatDate(next.startsAt)}`,
          },
        ]
      : []),
    { kind: "command", text: "gdg join --you" },
  ];

  return (
    <section className="relative flex min-h-[calc(100svh-4rem)] flex-col overflow-hidden">
      <PillShapes className="hidden lg:block" />

      <div className="relative mx-auto grid w-full max-w-content flex-1 items-center gap-12 px-4 py-10 sm:px-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="space-y-7">
          <p className="inline-flex items-center gap-2 rounded-full border-2 border-border-strong bg-surface px-4 py-1.5 font-mono text-xs shadow-sticker-sm sm:text-sm">
            <span aria-hidden className="size-2 shrink-0 rounded-full bg-green" />
            GDG on Campus · <span className="sm:hidden">AİBÜ</span>
            <span className="hidden sm:inline">Abant İzzet Baysal University</span>
          </p>

          <h1 className="text-[clamp(2.6rem,5.8vw,5.25rem)] leading-[1.02] font-bold tracking-tight">
            Birlikte <Sticker className="-rotate-2 bg-blue-pastel">öğreniyor,</Sticker>
            <br />
            birlikte <Sticker className="rotate-1 bg-green-pastel">üretiyoruz.</Sticker>
          </h1>

          <p className="max-w-xl text-lg text-fg-muted sm:text-xl">{site.about.intro}</p>

          <div className="flex flex-wrap gap-3">
            <ButtonLink href={site.links.coreTeamForm} tone="blue">
              Aramıza katıl
            </ButtonLink>
            <ButtonLink href="/ekip" tone="plain">
              Ekibi tanı
            </ButtonLink>
          </div>
        </div>

        <div className="lg:rotate-1">
          <TypingTerminal lines={lines} />
        </div>
      </div>
    </section>
  );
}

function Sticker({ className, children }: { className: string; children: ReactNode }) {
  return (
    <span
      className={`inline-block rounded-[0.4em] border-[3px] border-ink-black px-[0.15em] text-ink-black shadow-sticker ${className}`}
    >
      {children}
    </span>
  );
}
