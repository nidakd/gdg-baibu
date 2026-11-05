import Link from "next/link";
import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import { Avatar } from "@/components/team/avatar";
import type { Tone } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatTile } from "@/components/ui/stat-tile";
import type { Department } from "@/lib/insights";

// Core team'in hangi bölümlerden geldiği: solda sayılar, sağda her bölüm bir satır;
// satırdaki çubuk kişi sayısına göre uzar, içinde üyeler ekip renginde halkalı avatarlar.

const ring: Record<Tone, string> = {
  blue: "ring-blue",
  green: "ring-green",
  yellow: "ring-yellow",
  red: "ring-red",
  lilac: "ring-lilac",
  silver: "ring-silver",
};

export function Departments({ departments }: { departments: Department[] }) {
  const people = departments.reduce((n, d) => n + d.members.length, 0);
  const max = Math.max(...departments.map((d) => d.members.length));
  const engineering = departments.filter((d) => d.name.includes("Mühendisliği")).length;

  const stats = [
    { value: departments.length, label: "bölüm", tone: "lilac" as const },
    { value: people, label: "kişi", tone: "blue" as const },
    {
      value: departments.length - engineering,
      label: "mühendislik dışı",
      tone: "yellow" as const,
    },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:items-start">
      <dl className="grid grid-cols-3 gap-3 lg:grid-cols-1">
        {stats.map((s) => (
          <StatTile
            key={s.label}
            label={s.label}
            value={<CountUp to={s.value} />}
            tone={s.tone}
            size="md"
          />
        ))}
      </dl>

      <Card className="p-5 sm:p-6">
        <ul className="space-y-3">
          {departments.map((d, i) => (
            <li key={d.name}>
              <Reveal
                delay={i * 70}
                className="grid items-center gap-x-4 gap-y-2 sm:grid-cols-[14rem_1fr]"
              >
                <span className="flex items-baseline justify-between gap-3 text-sm font-medium">
                  {d.name}
                  <span className="font-mono text-xs text-fg-subtle sm:hidden">
                    {d.members.length}
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  <span
                    className="flex items-center gap-1.5 rounded-full border-2 border-border-strong bg-surface-2 p-1"
                    style={{ minWidth: `${(d.members.length / max) * 100}%` }}
                  >
                    {d.members.map((m) => (
                      <Link
                        key={m.slug}
                        href={`/ekip/${m.slug}`}
                        title={`${m.name} · ${m.team.name}`}
                        className={`block rounded-full ring-2 ring-offset-1 ring-offset-surface-2 transition hover:scale-110 ${ring[m.team.tone]}`}
                      >
                        <Avatar name={m.name} photoUrl={m.photoUrl} size={32} />
                      </Link>
                    ))}
                  </span>
                  <span className="hidden font-mono text-xs text-fg-subtle sm:inline">
                    {d.members.length}
                  </span>
                </span>
              </Reveal>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
