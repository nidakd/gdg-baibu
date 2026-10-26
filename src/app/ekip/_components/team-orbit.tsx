"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/components/motion/use-reduced-motion";
import { Avatar } from "@/components/team/avatar";
import type { Tone } from "@/components/ui/button";
import type { Member } from "@/lib/content";
import mark from "../../../../public/brand/gdg-mark.png";

// Yörünge + ekip kümeleri: herkes tek bir halkada, ekibiyle aynı dilimde küme halinde durur.
// Halka GDG simgesinin etrafında yavaşça döner (avatarlar dik kalır). Ekipler sırayla öne çıkar;
// ortada öne çıkan ekibin adı yazar. Bir ekibin üstüne gelince o ekip öne çıkar ve sıra bekler.
// Ölçüler kapsayıcı genişliğine göre (cqw).

const RING = 78; // halka çapı, kapsayıcının yüzdesi
const AVATAR = 11.5; // avatar çapı, cqw
const STEP = 20; // aynı ekipteki iki avatar arası açı (derece)
const CYCLE_MS = 2600;

const ring: Record<Tone, string> = {
  blue: "ring-blue",
  green: "ring-green",
  yellow: "ring-yellow",
  red: "ring-red",
};

// Tarayıcıya sadece gereken alanlar gider (tanıtım yazıları vb. değil)
type OrbitMember = Pick<Member, "slug" | "name" | "photoUrl">;
export type OrbitTeam = { id: string; tone: Tone; members: OrbitMember[] };

export function TeamOrbit({ teams }: { teams: OrbitTeam[] }) {
  const reduced = useReducedMotion();
  const [cycled, setCycled] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const active = hovered ?? (reduced ? null : teams[cycled % teams.length]?.id);
  const activeTeam = teams.find((t) => t.id === active);

  useEffect(() => {
    if (reduced || hovered) return;
    const id = setInterval(() => setCycled((c) => c + 1), CYCLE_MS);
    return () => clearInterval(id);
  }, [reduced, hovered]);

  // Her ekip halkada eşit bir dilim alır; üyeler dilimin ortasında STEP aralıkla dizilir
  const sector = 360 / teams.length;
  const layout = teams.map((team, t) => {
    const mid = -90 + sector * t + sector / 2;
    const span = (team.members.length - 1) * STEP;
    return {
      team,
      arc: { start: mid - span / 2 - 11, length: span + 22 },
      angles: team.members.map((_, i) => mid - span / 2 + i * STEP),
    };
  });

  return (
    <div className="orbit @container relative mx-auto aspect-square w-full max-w-[34rem]">
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-1/2 rounded-full border-2 border-dashed border-border"
        style={{ width: `${RING}%`, height: `${RING}%` }}
      />

      <div className="absolute top-1/2 left-1/2 flex -translate-1/2 flex-col items-center gap-[2cqw] pt-[9cqw]">
        <span className="grid size-[17cqw] place-items-center rounded-full border-2 border-border-strong bg-surface shadow-sticker">
          <Image src={mark} alt="" className="w-[62%]" />
        </span>
        <span
          aria-live="polite"
          className="h-[9cqw] text-center font-mono text-[clamp(10px,2.6cqw,13px)] leading-tight"
        >
          {activeTeam && (
            <>
              <span className="block font-bold">{activeTeam.id}/</span>
              <span className="block text-fg-subtle">{activeTeam.members.length} kişi</span>
            </>
          )}
        </span>
      </div>

      <div className="orbit-ring absolute inset-0" style={{ ["--orbit-dur" as string]: "140s" }}>
        {/* ekip dilimleri: üyelerin arkasında ekip renginde yay */}
        <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-0 size-full">
          {layout.map(({ team, arc }) => (
            <circle
              key={team.id}
              cx="50"
              cy="50"
              r={RING / 2}
              fill="none"
              pathLength={360}
              strokeDasharray={`${arc.length} ${360 - arc.length}`}
              strokeLinecap="round"
              strokeWidth={AVATAR + 4}
              transform={`rotate(${arc.start} 50 50)`}
              className="transition-opacity duration-500"
              style={{
                stroke: `var(--${team.tone}-soft)`,
                opacity: !active || active === team.id ? 1 : 0.35,
              }}
            />
          ))}
        </svg>

        <ul>
          {layout.flatMap(({ team, angles }) =>
            team.members.map((member, i) => {
              const angle = angles[i];
              const dim = active && active !== team.id;
              return (
                <li
                  key={member.slug}
                  className="absolute top-1/2 left-1/2"
                  style={{
                    width: `${AVATAR}cqw`,
                    height: `${AVATAR}cqw`,
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(${RING / 2}cqw) rotate(${-angle}deg)`,
                  }}
                  onPointerEnter={() => setHovered(team.id)}
                  onPointerLeave={() => setHovered(null)}
                >
                  <span className="orbit-upright block size-full">
                    <Link
                      href={`/ekip/${member.slug}`}
                      onFocus={() => setHovered(team.id)}
                      onBlur={() => setHovered(null)}
                      className={`group relative block size-full rounded-full ring-4 ring-offset-2 ring-offset-bg transition duration-500 hover:z-10 ${ring[team.tone]} ${
                        dim ? "scale-90 opacity-50" : active ? "scale-110" : ""
                      }`}
                    >
                      <Avatar
                        name={member.name}
                        photoUrl={member.photoUrl}
                        size={96}
                        priority
                        fluid
                      />
                      <span className="pointer-events-none absolute top-full left-1/2 z-20 mt-2 -translate-x-1/2 rounded-full border-2 border-border-strong bg-surface px-2.5 py-0.5 font-mono text-[11px] whitespace-nowrap opacity-0 shadow-sticker-sm transition group-hover:opacity-100 group-focus-visible:opacity-100">
                        {member.name.split(" ")[0]}
                      </span>
                    </Link>
                  </span>
                </li>
              );
            }),
          )}
        </ul>
      </div>
    </div>
  );
}
