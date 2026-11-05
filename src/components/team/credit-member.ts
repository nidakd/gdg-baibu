import type { Tone } from "@/components/ui/button";
import type { Member } from "@/lib/content";

// Ekip tipografi bileşenlerinin (isim listesi, kalkış tablosu, kinetik satırlar) ortak verisi.
// İstemci bileşenlerine sunucudaki Member nesnesinin sadece gereken kısmı gider.

export type CreditMember = {
  slug: string;
  name: string;
  role: string;
  team: string;
  tone: Tone;
  photoUrl: string | null;
};

export function toCreditMember(m: Member): CreditMember {
  return {
    slug: m.slug,
    name: m.name,
    role: m.role,
    team: m.team.id,
    tone: m.team.tone,
    photoUrl: m.photoUrl,
  };
}

/** Ekip rozeti: pastel zemin, okunur (ink) yazı */
export const badge: Record<Tone, string> = {
  blue: "bg-blue-soft text-blue-ink",
  green: "bg-green-soft text-green-ink",
  yellow: "bg-yellow-soft text-yellow-ink",
  red: "bg-red-soft text-red-ink",
  lilac: "bg-lilac-soft text-lilac-ink",
  silver: "bg-silver-soft text-silver-ink",
};
export const ring: Record<Tone, string> = {
  blue: "ring-blue",
  green: "ring-green",
  yellow: "ring-yellow",
  red: "ring-red",
  lilac: "ring-lilac",
  silver: "ring-silver",
};
export const dot: Record<Tone, string> = {
  blue: "bg-blue",
  green: "bg-green",
  yellow: "bg-yellow",
  red: "bg-red",
  lilac: "bg-lilac",
  silver: "bg-silver",
};
