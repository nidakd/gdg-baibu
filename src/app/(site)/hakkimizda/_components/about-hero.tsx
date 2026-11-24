import type { ReactNode } from "react";
import { Avatar } from "@/components/team/avatar";
import { getMembers, getSite } from "@/lib/content";
import { formatMonth } from "@/lib/format";

/** Hakkımızda girişi: solda metin, sağda core team fotoğraflarından kolaj. */
export async function AboutHero() {
  const site = getSite();
  const members = await getMembers();
  // Fotoğraflar farklı boyut ve hafif kaymayla, elle yapıştırılmış gibi
  const sizes = [88, 64, 76, 60, 84, 68, 72];
  return (
    <div className="grid items-center gap-12 lg:grid-cols-[1.25fr_1fr]">
      <div className="space-y-6">
        <p className="font-mono text-sm text-fg-subtle">
          # biz kimiz? · {formatMonth(site.gdgCommunitySince)}&apos;ten beri
        </p>
        <h1 className="text-5xl font-bold tracking-tight text-balance sm:text-6xl">
          {site.about.title}
        </h1>
        <p className="max-w-xl text-xl">{site.about.intro}</p>
        {site.about.paragraphs.map((p) => (
          <p key={p} className="max-w-xl text-fg-muted">
            {p}
          </p>
        ))}
      </div>
      <div className="relative mx-auto max-w-md">
        <ul className="flex flex-wrap justify-center gap-3">
          {members.map((m, i) => (
            <li
              key={m.slug}
              className={i % 2 ? "translate-y-4" : "-translate-y-1"}
              style={{ rotate: `${((i * 37) % 9) - 4}deg` }}
            >
              <Avatar
                name={m.name}
                photoUrl={m.photoUrl}
                size={sizes[i % sizes.length]}
                className="shadow-sticker-sm"
              />
            </li>
          ))}
        </ul>
        <Badge className="-top-6 -left-4 -rotate-6 bg-yellow-halftone">
          {site.stats.communityMembers} üye
        </Badge>
        <Badge className="-right-2 -bottom-8 rotate-3 bg-blue-halftone">
          {members.length} kişilik core team
        </Badge>
      </div>
    </div>
  );
}

function Badge({ className, children }: { className: string; children: ReactNode }) {
  return (
    <span
      className={`absolute rounded-full border-2 border-ink-black px-4 py-1.5 font-mono text-sm font-bold text-ink-black shadow-sticker-sm ${className}`}
    >
      {children}
    </span>
  );
}
