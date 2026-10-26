import Image from "next/image";
import Link from "next/link";
import { Avatar } from "@/components/team/avatar";
import type { Tone } from "@/components/ui/button";
import type { Member } from "@/lib/content";
import mark from "../../../../public/brand/gdg-mark.png";

// Ekip, ortadaki GDG simgesinin etrafında üç halkada döner:
// içte yönetim, ortada koordinatörler, dışta ekip üyeleri. Halkalar ters yönlere döner,
// avatarlar dik kalır; üstüne gelince dönme durur. Ölçüler kapsayıcı genişliğine göre (cqw).

const ring: Record<Tone, string> = {
  blue: "ring-blue",
  green: "ring-green",
  yellow: "ring-yellow",
  red: "ring-red",
  lilac: "ring-lilac",
  silver: "ring-silver",
};

type Orbit = {
  members: Member[];
  /** halka çapı, kapsayıcı genişliğinin yüzdesi */
  diameter: number;
  /** avatar çapı, cqw */
  avatar: number;
  duration: string;
  reverse?: boolean;
  /** halkadaki ilk avatarın açısı (derece) */
  offset: number;
};

export function TeamOrbit({ members }: { members: Member[] }) {
  const leaders = members.filter((m) => m.team.kind === "leadership");
  const coordinators = members.filter((m) => m.team.kind === "team" && m.role === "Koordinatör");
  const rest = members.filter((m) => !leaders.includes(m) && !coordinators.includes(m));

  const orbits: Orbit[] = [
    { members: leaders, diameter: 38, avatar: 11.5, duration: "50s", offset: -90 },
    {
      members: coordinators,
      diameter: 66,
      avatar: 10,
      duration: "70s",
      reverse: true,
      offset: -54,
    },
    { members: rest, diameter: 92, avatar: 9, duration: "95s", offset: -60 },
  ];

  return (
    <div className="orbit @container relative mx-auto aspect-square w-full max-w-[34rem]">
      {orbits.map((o) => (
        <div
          key={o.diameter}
          aria-hidden
          className="absolute top-1/2 left-1/2 -translate-1/2 rounded-full border-2 border-dashed border-border"
          style={{ width: `${o.diameter}%`, height: `${o.diameter}%` }}
        />
      ))}

      <span className="absolute top-1/2 left-1/2 grid size-[16cqw] -translate-1/2 place-items-center rounded-full border-2 border-border-strong bg-surface shadow-sticker">
        <Image src={mark} alt="" className="w-[62%]" />
      </span>

      {orbits.map((o) => (
        <ul
          key={o.diameter}
          data-reverse={o.reverse || undefined}
          className="orbit-ring absolute inset-0"
          style={{ ["--orbit-dur" as string]: o.duration }}
        >
          {o.members.map((member, i) => {
            const angle = o.offset + (360 / o.members.length) * i;
            return (
              <li
                key={member.slug}
                className="absolute top-1/2 left-1/2"
                style={{
                  width: `${o.avatar}cqw`,
                  height: `${o.avatar}cqw`,
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(${o.diameter / 2}cqw) rotate(${-angle}deg)`,
                }}
              >
                <span className="orbit-upright block size-full">
                  <Link
                    href={`/ekip/${member.slug}`}
                    className={`group relative block size-full rounded-full ring-4 ring-offset-2 ring-offset-bg transition hover:z-10 hover:scale-115 focus-visible:scale-115 ${ring[member.team.tone]}`}
                  >
                    <Avatar
                      name={member.name}
                      photoUrl={member.photoUrl}
                      size={96}
                      priority
                      fluid
                    />
                    <span className="pointer-events-none absolute top-full left-1/2 z-20 mt-2 -translate-x-1/2 rounded-full border-2 border-border-strong bg-surface px-2.5 py-0.5 font-mono text-[11px] whitespace-nowrap opacity-0 shadow-sticker-sm transition group-hover:opacity-100 group-focus-visible:opacity-100">
                      {member.name.split(" ")[0]} · {member.team.id}/
                    </span>
                  </Link>
                </span>
              </li>
            );
          })}
        </ul>
      ))}
    </div>
  );
}
