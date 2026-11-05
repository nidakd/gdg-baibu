import Image from "next/image";
import Link from "next/link";
import type { Tone } from "@/components/ui/button";
import type { Member } from "@/lib/content";

// Ekip, film jeneriği gibi aşağıdan yukarı akan bir liste: solda rol ve ekip, sağda büyük ad.
// Listenin sonu "ve sen?" ile core team başvurusuna çıkar. Üstüne gelince akış durur,
// fareyle gelinen adın yanında fotoğrafı belirir. "Hareketi azalt" açıksa liste sabit ve kaydırılabilir.
// Stiller bileşenin içinde: globals.css değişince geliştirme sunucusu eski CSS'i gösterebiliyor.

const ring: Record<Tone, string> = {
  blue: "ring-blue",
  green: "ring-green",
  yellow: "ring-yellow",
  red: "ring-red",
  lilac: "ring-lilac",
  silver: "ring-silver",
};
const text: Record<Tone, string> = {
  blue: "group-hover:text-blue-ink",
  green: "group-hover:text-green-ink",
  yellow: "group-hover:text-yellow-ink",
  red: "group-hover:text-red-ink",
  lilac: "group-hover:text-lilac-ink",
  silver: "group-hover:text-silver-ink",
};

const SECONDS_PER_ROW = 2.2;

function Roll({ members, joinHref, copy }: { members: Member[]; joinHref: string; copy: number }) {
  const hidden = copy === 1;
  return (
    <ol aria-hidden={hidden || undefined} inert={hidden || undefined} className="pb-24">
      {members.map((m) => (
        <li
          key={m.slug}
          className="credit-row grid grid-cols-[6rem_1fr] items-baseline gap-5 py-2.5 sm:grid-cols-[10rem_1fr] sm:gap-8"
        >
          <span className="text-right font-mono text-[11px] leading-tight text-fg-subtle sm:text-xs">
            {m.role.toLocaleLowerCase("tr")}
            <br />
            {m.team.id}/
          </span>
          <Link href={`/ekip/${m.slug}`} className="group relative inline-block w-fit">
            <span
              className={`block text-2xl leading-tight font-bold tracking-tight transition-colors sm:text-[clamp(1.75rem,3vw,2.4rem)] sm:leading-none sm:whitespace-nowrap ${text[m.team.tone]}`}
            >
              {m.name}
            </span>
            {m.photoUrl && (
              <span
                className={`absolute top-1/2 left-full ml-4 size-14 -translate-y-1/2 scale-50 overflow-hidden rounded-full opacity-0 ring-[3px] transition duration-300 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100 ${ring[m.team.tone]}`}
              >
                <Image src={m.photoUrl} alt="" fill sizes="3.5rem" className="object-cover" />
              </span>
            )}
          </Link>
        </li>
      ))}
      <li className="credit-row grid grid-cols-[6rem_1fr] items-baseline gap-5 pt-10 sm:grid-cols-[10rem_1fr] sm:gap-8">
        <span className="text-right font-mono text-xs text-fg-subtle">ve</span>
        <a
          href={joinHref}
          target="_blank"
          rel="noreferrer"
          className="w-fit text-5xl leading-none font-bold tracking-tight text-blue-ink hover:underline sm:text-6xl"
        >
          sen?
        </a>
      </li>
    </ol>
  );
}

export function TeamCredits({ members, joinHref }: { members: Member[]; joinHref: string }) {
  // Önce yönetim, sonra ekipler sitedeki sırayla; her ekipte koordinatör önde
  const teamIndex = new Map<string, number>();
  members.forEach((m) => teamIndex.has(m.team.id) || teamIndex.set(m.team.id, teamIndex.size));
  const ordered = [...members].sort(
    (a, b) =>
      Number(b.team.kind === "leadership") - Number(a.team.kind === "leadership") ||
      teamIndex.get(a.team.id)! - teamIndex.get(b.team.id)! ||
      Number(b.role === "Koordinatör") - Number(a.role === "Koordinatör") ||
      a.order - b.order,
  );
  const duration = `${(ordered.length + 2) * SECONDS_PER_ROW}s`;

  return (
    <div className="credits relative h-[30rem] w-full min-w-0 overflow-hidden sm:h-[34rem]">
      <style>{`
        .credits { mask-image: linear-gradient(transparent, black 18%, black 82%, transparent); }
        .credits-track { animation: credits-roll var(--dur) linear infinite; }
        .credits:hover .credits-track, .credits:focus-within .credits-track { animation-play-state: paused; }
        .credits:has(.credit-row a:hover) .credit-row:not(:has(a:hover)) { opacity: .35; }
        .credit-row { transition: opacity .3s; }
        @keyframes credits-roll { to { transform: translateY(-50%); } }
        @media (prefers-reduced-motion: reduce) {
          .credits { overflow-y: auto; }
          .credits-track { animation: none; }
          .credits-track > :nth-child(2) { display: none; }
        }
      `}</style>
      <div className="credits-track" style={{ ["--dur" as string]: duration }}>
        {[0, 1].map((copy) => (
          <Roll key={copy} copy={copy} members={ordered} joinHref={joinHref} />
        ))}
      </div>
    </div>
  );
}
