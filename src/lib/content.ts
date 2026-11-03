// content/ klasöründeki başlangıç verisini tipli olarak okur.
// Supabase'e geçince bu fonksiyonların imzası korunur, sadece veri kaynağı değişir.

import siteJson from "../../content/site.json";
import teamJson from "../../content/team.json";
import eventsJson from "../../content/events.json";
import type { Tone } from "@/components/ui/button";
import { slugify } from "./slug";

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
  tags: string[];
  speakers: Speaker[];
  photos: string[];
  sourceUrl: string;
};

const teams = teamJson.teams as Team[];
const teamById = new Map(teams.map((t) => [t.id, t]));

const isYear = (y: unknown): y is Member["year"] =>
  y === null || y === "mezun" || typeof y === "number";

const members: Member[] = teamJson.members
  .map((m) => {
    const team = teamById.get(m.team);
    if (!team) throw new Error(`team.json: "${m.name}" bilinmeyen ekipte (${m.team})`);
    if (!isYear(m.year))
      throw new Error(`team.json: "${m.name}" için year sayı, "mezun" ya da null olmalı`);
    return { ...m, year: m.year, slug: slugify(m.name), team };
  })
  .sort((a, b) => a.order - b.order);

const events = (eventsJson as Event[]).slice().sort((a, b) => b.startsAt.localeCompare(a.startsAt));

export function getSite(): Site {
  return siteJson;
}

/** Yönetim dahil tüm gruplar, gösterim sırasıyla. */
export function getTeams(): Team[] {
  return teams;
}

/** Sadece çalışma ekipleri (yönetim hariç). */
export function getWorkingTeams(): Team[] {
  return teams.filter((t) => t.kind === "team");
}

export function getMembers(): Member[] {
  return members;
}

export function getMemberBySlug(slug: string): Member | undefined {
  return members.find((m) => m.slug === slug);
}

export function getMembersByTeam(teamId: string): Member[] {
  return members.filter((m) => m.team.id === teamId);
}

/** En yeniden en eskiye sıralı tüm etkinlikler. */
export function getEvents(): Event[] {
  return events;
}

export function getEventBySlug(slug: string): Event | undefined {
  return events.find((e) => e.slug === slug);
}
