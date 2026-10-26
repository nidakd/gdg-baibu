import Link from "next/link";
import { Avatar } from "@/components/team/avatar";
import type { Tone } from "@/components/ui/button";
import type { Member } from "@/lib/content";

// Başlık alanında, ekip renginde halkalarla havada süzülen avatarlar.
// Ekipler sırayla karıştırılır ki aynı renkler yan yana toplanmasın.

const ring: Record<Tone, string> = {
  blue: "ring-blue",
  green: "ring-green",
  yellow: "ring-yellow",
  red: "ring-red",
};

function interleaveByTeam(members: Member[]): Member[] {
  const groups = new Map<string, Member[]>();
  for (const m of members) groups.set(m.team.id, [...(groups.get(m.team.id) ?? []), m]);
  const queues = [...groups.values()];
  const out: Member[] = [];
  while (queues.some((q) => q.length)) {
    for (const q of queues) {
      const next = q.shift();
      if (next) out.push(next);
    }
  }
  return out;
}

function sizeOf(member: Member): number {
  if (member.team.kind === "leadership") return 80;
  if (member.role === "Koordinatör") return 68;
  return 58;
}

export function AvatarCloud({ members }: { members: Member[] }) {
  return (
    <ul className="mx-auto flex max-w-xl flex-wrap items-center justify-center gap-x-3 gap-y-4 py-6">
      {interleaveByTeam(members).map((member, i) => (
        <li
          key={member.slug}
          className={`animate-float ${i % 2 ? "mt-8" : ""}`}
          style={{ animationDelay: `${-((i * 0.7) % 7)}s` }}
        >
          <Link
            href={`/ekip/${member.slug}`}
            className={`group relative block rounded-full ring-4 ring-offset-2 ring-offset-bg transition hover:z-10 hover:scale-110 ${ring[member.team.tone]}`}
          >
            <Avatar name={member.name} photoUrl={member.photoUrl} size={sizeOf(member)} priority />
            <span className="pointer-events-none absolute -bottom-9 left-1/2 z-10 -translate-x-1/2 rounded-full border-2 border-border-strong bg-surface px-2.5 py-0.5 font-mono text-[11px] whitespace-nowrap opacity-0 shadow-sticker-sm transition group-hover:opacity-100 group-focus-visible:opacity-100">
              {member.name.split(" ")[0]} · {member.team.id}/
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
