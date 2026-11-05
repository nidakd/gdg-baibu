import Image from "next/image";
import Link from "next/link";
import type { Tone } from "@/components/ui/button";
import type { Member, Team } from "@/lib/content";
import { initials } from "@/lib/format";

// Logodaki haplardan: her ekip kendi renginde, eğik duran bir hap; içinde üyelerin
// fotoğrafları ve ekip adı. Üstüne gelince hap düzleşip kalkar, fotoğraflar aralanır.
// Tıklayınca sayfadaki ekip bölümüne iner.

const fill: Record<Tone, string> = {
  blue: "bg-blue",
  green: "bg-green",
  yellow: "bg-yellow",
  red: "bg-red",
  lilac: "bg-lilac",
  silver: "bg-silver",
};

const tilt = ["-rotate-6", "rotate-3", "-rotate-2", "rotate-6", "-rotate-3", "rotate-2"];

export function TeamPills({ teams, members }: { teams: Team[]; members: Member[] }) {
  return (
    <ul className="flex flex-col gap-4 px-3 py-4">
      {teams.map((t, i) => {
        const list = members.filter((m) => m.team.id === t.id);
        return (
          <li key={t.id} className={i % 2 ? "self-end" : "self-start"}>
            <Link
              href={`/ekip#${t.id}`}
              aria-label={`${t.name}: ${list.map((m) => m.name).join(", ")}`}
              className={`group flex items-center gap-3 rounded-full border-[3px] border-ink-black py-2 pr-6 pl-2 text-ink-black shadow-sticker transition duration-300 hover:-translate-y-1 hover:rotate-0 hover:shadow-sticker-lg focus-visible:rotate-0 ${fill[t.tone]} ${tilt[i % tilt.length]}`}
            >
              <span className="flex -space-x-3 transition-[gap] group-hover:space-x-0.5">
                {list.map((m) => (
                  <span
                    key={m.slug}
                    className="relative block size-11 shrink-0 overflow-hidden rounded-full border-2 border-ink-black bg-surface-2 sm:size-12"
                  >
                    {m.photoUrl ? (
                      <Image src={m.photoUrl} alt="" fill sizes="3rem" className="object-cover" />
                    ) : (
                      <span className="grid size-full place-items-center font-mono text-xs">
                        {initials(m.name)}
                      </span>
                    )}
                  </span>
                ))}
              </span>
              <span className="font-mono text-sm font-bold whitespace-nowrap">{t.id}/</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
