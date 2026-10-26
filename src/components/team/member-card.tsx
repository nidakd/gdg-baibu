import Link from "next/link";
import { Tilt } from "@/components/motion/tilt";
import type { Tone } from "@/components/ui/button";
import type { Member } from "@/lib/content";
import { Avatar } from "./avatar";

// Kart, kişinin ekibinin renginde: pastel zemin, üstüne gelince çekirdek renkte halka
const tones: Record<Tone, { card: string; ring: string }> = {
  blue: { card: "bg-blue-soft", ring: "ring-offset-blue-soft group-hover:ring-blue" },
  green: { card: "bg-green-soft", ring: "ring-offset-green-soft group-hover:ring-green" },
  yellow: { card: "bg-yellow-soft", ring: "ring-offset-yellow-soft group-hover:ring-yellow" },
  red: { card: "bg-red-soft", ring: "ring-offset-red-soft group-hover:ring-red" },
  lilac: { card: "bg-lilac-soft", ring: "ring-offset-lilac-soft group-hover:ring-lilac" },
  silver: { card: "bg-silver-soft", ring: "ring-offset-silver-soft group-hover:ring-silver" },
};

/** Tanıtım yazısının ilk cümlesi; kartta iki satırlık önizleme olarak görünür. */
// Kartlarda tekrar etmesin diye baştaki üniversite adı atılır: "Bilgisayar Mühendisliği 2. sınıf…"
function firstSentence(bio: string | null): string | null {
  if (!bio) return null;
  // cümle sonu: ardından büyük harf gelen nokta ("2. sınıf" gibi sıra sayıları bölünmesin)
  const match = bio.match(/^.+?[.!?](?=\s+[A-ZÇĞİÖŞÜ0-9]|$)/);
  return (match ? match[0] : bio)
    .replace(/^(Bolu )?Abant İzzet Baysal Üniversitesi(nde|'nde)?\s+/, "")
    .trim();
}

/** showTeam: ekip penceresinin içindeyken ekip adı tekrar yazılmaz */
export function MemberCard({ member, showTeam = true }: { member: Member; showTeam?: boolean }) {
  const preview = firstSentence(member.bio);
  const tone = tones[member.team.tone];

  return (
    <Tilt>
      <Link
        href={`/ekip/${member.slug}`}
        className={`group flex h-full flex-col rounded-card border-2 border-border-strong p-4 shadow-sticker-sm transition-shadow hover:shadow-sticker ${tone.card}`}
      >
        <span className="flex items-center gap-4">
          <span
            className={`shrink-0 rounded-full ring-0 ring-offset-2 transition-all duration-300 group-hover:rotate-6 group-hover:ring-4 ${tone.ring}`}
          >
            <Avatar name={member.name} photoUrl={member.photoUrl} size={64} />
          </span>
          <span className="min-w-0">
            <span className="block font-bold group-hover:underline">{member.name}</span>
            <span className="block text-sm text-fg-muted">{member.role}</span>
            {showTeam && (
              <span className="mt-1 block truncate font-mono text-xs text-fg-subtle">
                {member.team.name}
              </span>
            )}
          </span>
        </span>
        {preview && (
          <span className="mt-3 line-clamp-2 border-t border-dashed border-border-strong/30 pt-3 text-sm text-fg-muted">
            {preview}
          </span>
        )}
      </Link>
    </Tilt>
  );
}
