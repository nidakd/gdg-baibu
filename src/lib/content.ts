// content/ klasöründeki başlangıç verisini tipli olarak okur.
// Supabase'e geçince bu fonksiyonların imzası korunur, sadece veri kaynağı değişir.

import siteJson from "../../content/site.json";
import teamJson from "../../content/team.json";
import eventsJson from "../../content/events.json";
import { slugify } from "./slug";

export type Site = typeof siteJson;

export type Team = {
  id: string;
  name: string;
  description: string | null;
};

export type Member = {
  slug: string;
  name: string;
  role: string;
  team: Team;
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

const teams: Team[] = teamJson.teams;
const teamById = new Map(teams.map((t) => [t.id, t]));

const members: Member[] = teamJson.members
  .map((m) => {
    const team = teamById.get(m.team);
    if (!team) throw new Error(`team.json: "${m.name}" bilinmeyen ekipte (${m.team})`);
    return { ...m, slug: slugify(m.name), team };
  })
  .sort((a, b) => a.order - b.order);

const events = (eventsJson as Event[])
  .slice()
  .sort((a, b) => b.startsAt.localeCompare(a.startsAt));

export function getSite(): Site {
  return siteJson;
}

export function getTeams(): Team[] {
  return teams;
}

export function getMembers(): Member[] {
  return members;
}

export function getMemberBySlug(slug: string): Member | undefined {
  return members.find((m) => m.slug === slug);
}

/** En yeniden en eskiye sıralı tüm etkinlikler. */
export function getEvents(): Event[] {
  return events;
}

export function getEventBySlug(slug: string): Event | undefined {
  return events.find((e) => e.slug === slug);
}
