// Sitenin verisini tipli olarak okur. Ekip Supabase'den gelir (panelden düzenlenir),
// ulaşılamazsa content/team.json'a düşer; site ve etkinlikler hâlâ content/ dosyalarından.

import siteJson from "../../content/site.json";
import teamJson from "../../content/team.json";
import eventsJson from "../../content/events.json";
import photosJson from "../../content/photos.json";
import eventNotesJson from "../../content/event-notes.json";
import { cacheLife, cacheTag } from "next/cache";
import type { Tone } from "@/components/ui/button";
import { slugify } from "./slug";
import { publicClient } from "./supabase/public";

/** Panel ekipte bir şey kaydedince bu etiketle önbellek yenilenir. */
export const TEAM_CACHE_TAG = "ekip";

export type Site = typeof siteJson;

export type Team = {
  id: string;
  name: string;
  /** GDG Community'deki İngilizce adı */
  nameEn: string;
  /** Yönetim (organizatörler, mentor) ekip sayısına dahil edilmez */
  kind: "leadership" | "team";
  description: string | null;
  tone: Tone;
};

export type Member = {
  slug: string;
  name: string;
  role: string;
  team: Team;
  /** Tanıtım yazısından alınan bölüm adı */
  department: string | null;
  /** Sınıf (1–4), mezunsa "mezun", bilinmiyorsa null */
  year: number | "mezun" | null;
  photoUrl: string | null;
  bio: string | null;
  links: Partial<Record<"gdgCommunity" | "linkedin" | "github" | "instagram" | "website", string>>;
  order: number;
};

export type Speaker = {
  name: string;
  title: string | null;
  company: string | null;
  photoUrl: string | null;
};

export type Event = {
  id: string;
  slug: string;
  title: string;
  startsAt: string;
  endsAt: string;
  format: "in-person" | "online";
  venue: string | null;
  summary: string | null;
  descriptionHtml: string | null;
  coverUrl: string | null;
  /** Afişin en/boy oranı (kenar boşluğu kırpıldıktan sonra); bilinmiyorsa null */
  coverAspect: number | null;
  tags: string[];
  speakers: Speaker[];
  photos: string[];
  sourceUrl: string;
  /** Türkçe metin (content/event-notes.json); yoksa sayfada İngilizce orijinal görünür */
  tr: { summary: string; paragraphs: string[] } | null;
};

type EventNote = { ozet: string; aciklama: string[] };
const eventNotes = eventNotesJson as unknown as Record<string, EventNote | string>;

type TeamData = { teams: Team[]; members: Member[] };

const isYear = (y: unknown): y is Member["year"] =>
  y === null || y === "mezun" || typeof y === "number";

/** Yedek: content/team.json (Supabase yoksa ya da cevap vermezse). */
function teamFromJson(): TeamData {
  const teams = teamJson.teams as Team[];
  const teamById = new Map(teams.map((t) => [t.id, t]));
  const members = teamJson.members
    .map((m) => {
      const team = teamById.get(m.team);
      if (!team) throw new Error(`team.json: "${m.name}" bilinmeyen ekipte (${m.team})`);
      if (!isYear(m.year))
        throw new Error(`team.json: "${m.name}" için year sayı, "mezun" ya da null olmalı`);
      return { ...m, year: m.year, slug: slugify(m.name), team };
    })
    .sort((a, b) => a.order - b.order);
  return { teams, members };
}

type TeamRow = {
  id: string;
  name: string;
  name_en: string;
  kind: Team["kind"];
  tone: Tone;
  description: string | null;
};
type MemberRow = {
  slug: string;
  name: string;
  role: string;
  team_id: string;
  department: string | null;
  year: string | null;
  photo_url: string | null;
  bio: string | null;
  links: Member["links"] | null;
  sort_order: number;
};

const toYear = (y: string | null): Member["year"] =>
  y === null ? null : y === "mezun" ? "mezun" : Number(y);

/** Supabase'den aktif üyeler ve ekipler. Hata olursa null. */
async function teamFromDb(): Promise<TeamData | null> {
  const db = publicClient();
  if (!db) return null;
  const [t, m] = await Promise.all([
    db.from("teams").select("id,name,name_en,kind,tone,description").order("sort_order"),
    db
      .from("team_members")
      .select("slug,name,role,team_id,department,year,photo_url,bio,links,sort_order")
      .eq("active", true)
      .order("sort_order"),
  ]);
  if (t.error || m.error || !t.data?.length) {
    console.error("[ekip] Supabase okunamadı, team.json kullanılıyor", t.error ?? m.error);
    return null;
  }
  const teams: Team[] = (t.data as TeamRow[]).map((r) => ({
    id: r.id,
    name: r.name,
    nameEn: r.name_en,
    kind: r.kind,
    tone: r.tone,
    description: r.description,
  }));
  const teamById = new Map(teams.map((x) => [x.id, x]));
  const members = (m.data as MemberRow[]).flatMap((r) => {
    const team = teamById.get(r.team_id);
    if (!team) return [];
    return [
      {
        slug: r.slug,
        name: r.name,
        role: r.role,
        team,
        department: r.department,
        year: toYear(r.year),
        photoUrl: r.photo_url,
        bio: r.bio,
        links: r.links ?? {},
        order: r.sort_order,
      },
    ];
  });
  return { teams, members };
}

/** Ekip verisi önbellekte tutulur; panelde kaydedince TEAM_CACHE_TAG ile yenilenir. */
async function loadTeam(): Promise<TeamData> {
  "use cache";
  cacheTag(TEAM_CACHE_TAG);
  cacheLife("hours");
  try {
    return (await teamFromDb()) ?? teamFromJson();
  } catch (err) {
    console.error("[ekip] Supabase hatası, team.json kullanılıyor", err);
    return teamFromJson();
  }
}

const events: Event[] = (eventsJson as Omit<Event, "tr">[])
  .map((e) => {
    const note = eventNotes[e.slug];
    return {
      ...e,
      tr: typeof note === "object" ? { summary: note.ozet, paragraphs: note.aciklama } : null,
    };
  })
  .sort((a, b) => b.startsAt.localeCompare(a.startsAt));

export function getSite(): Site {
  return siteJson;
}

/** Yönetim dahil tüm gruplar, gösterim sırasıyla. */
export async function getTeams(): Promise<Team[]> {
  return (await loadTeam()).teams;
}

/** Sadece çalışma ekipleri (yönetim hariç). */
export async function getWorkingTeams(): Promise<Team[]> {
  return (await getTeams()).filter((t) => t.kind === "team");
}

export async function getMembers(): Promise<Member[]> {
  return (await loadTeam()).members;
}

export async function getMemberBySlug(slug: string): Promise<Member | undefined> {
  return (await getMembers()).find((m) => m.slug === slug);
}

export async function getMembersByTeam(teamId: string): Promise<Member[]> {
  return (await getMembers()).filter((m) => m.team.id === teamId);
}

/** En yeniden en eskiye sıralı tüm etkinlikler. */
export function getEvents(): Event[] {
  return events;
}

export function getEventBySlug(slug: string): Event | undefined {
  return events.find((e) => e.slug === slug);
}

/** Ana sayfadaki "etkinliklerden kareler" şeridi. Senkron events.json'u ezdiği için ayrı dosyada. */
export type Photo = {
  src: string;
  alt: string;
  width: number;
  height: number;
  event: { slug: string; title: string; startsAt: string };
};

export function getPhotos(): Photo[] {
  return photosJson.flatMap(({ event: slug, ...photo }) => {
    const event = getEventBySlug(slug);
    return event ? [{ ...photo, event: { slug, title: event.title, startsAt: event.startsAt } }] : [];
  });
}

/** Etkinlik sayfasındaki galeri: önce seçilen kareler (photos.json), sonra GDG Community "wrap-up" fotoğrafları. */
export type GalleryPhoto = { src: string; alt: string; width?: number; height?: number };

export function getEventPhotos(event: Event): GalleryPhoto[] {
  const picked = photosJson
    .filter((p) => p.event === event.slug)
    .map(({ src, alt, width, height }) => ({ src, alt, width, height }));
  const wrapup = event.photos.map((src, i) => ({
    src,
    alt: `${event.title} etkinliğinden fotoğraf ${picked.length + i + 1}`,
  }));
  return [...picked, ...wrapup];
}
