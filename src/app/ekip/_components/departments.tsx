import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { Avatar } from "@/components/team/avatar";
import type { Tone } from "@/components/ui/button";
import { Window } from "@/components/ui/window";
import { getDepartments } from "@/lib/insights";

// Core team'in hangi bölümlerden geldiği: her bölüm bir satır, üyeleri ekip renginde halkalı avatarlar.

const ring: Record<Tone, string> = {
  blue: "ring-blue",
  green: "ring-green",
  yellow: "ring-yellow",
  red: "ring-red",
  lilac: "ring-lilac",
  silver: "ring-silver",
};

export function Departments() {
  const departments = getDepartments();
  const people = departments.reduce((n, d) => n + d.members.length, 0);
  const max = Math.max(...departments.map((d) => d.members.length));

  return (
    <Window title="~/team/bolumler" meta={`${departments.length} bölüm`} tone="silver">
      <div className="space-y-6 p-5 sm:p-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Farklı bölümlerden geliyoruz</h2>
          <p className="text-fg-muted">
            {people} kişi, {departments.length} bölüm. Mühendislikten edebiyata: hangi bölümde
            okuduğun fark etmez.
          </p>
        </div>
        <ul className="space-y-3">
          {departments.map((d, i) => (
            <li key={d.name}>
              <Reveal
                delay={i * 70}
                className="grid items-center gap-x-4 gap-y-2 sm:grid-cols-[15rem_1fr]"
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
      </div>
    </Window>
  );
}
