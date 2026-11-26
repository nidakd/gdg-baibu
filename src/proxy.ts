// İki iş:
// 1. Var olmayan /ekip/[kişi] ve /etkinlikler/[etkinlik] adreslerini sayfa render edilmeden önce gerçek
//    404'e çevirir (Cache Components açıkken dynamicParams kullanılamıyor). Üye adresleri panelden
//    değişebildiği için Supabase'den okunur ve bir dakika bellekte tutulur; ulaşılamazsa team.json.
// 2. /panel: Supabase oturumunu yeniler, giriş yoksa /giris'e yollar. Asıl yetki kontrolü
//    sunucu tarafında (lib/panel/auth.ts) ve veritabanında (RLS) yapılır; burası sadece ilk kapı.

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import eventsJson from "../content/events.json";
import teamJson from "../content/team.json";
import { slugify } from "./lib/slug";
import { SUPABASE_KEY, SUPABASE_URL, hasSupabase } from "./lib/supabase/env";

const eventSlugs = new Set(eventsJson.map((e) => e.slug));
const jsonMemberSlugs = new Set(teamJson.members.map((m) => slugify(m.name)));

let memberCache: { slugs: Set<string>; at: number } | null = null;
const MEMBER_TTL_MS = 60_000;

async function memberSlugs(): Promise<Set<string>> {
  if (!hasSupabase) return jsonMemberSlugs;
  if (memberCache && Date.now() - memberCache.at < MEMBER_TTL_MS) return memberCache.slugs;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/team_members?select=slug&active=eq.true`, {
      headers: { apikey: SUPABASE_KEY },
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) throw new Error(String(res.status));
    const rows = (await res.json()) as { slug: string }[];
    memberCache = { slugs: new Set(rows.map((r) => r.slug)), at: Date.now() };
    return memberCache.slugs;
  } catch {
    return memberCache?.slugs ?? jsonMemberSlugs;
  }
}

let eventCache: { slugs: Set<string>; at: number } | null = null;

/** GDG Community etkinlikleri + panelden yayınlananlar */
async function knownEventSlugs(): Promise<Set<string>> {
  if (!hasSupabase) return eventSlugs;
  if (eventCache && Date.now() - eventCache.at < MEMBER_TTL_MS) return eventCache.slugs;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/site_events?select=slug&published=eq.true`, {
      headers: { apikey: SUPABASE_KEY },
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) throw new Error(String(res.status));
    const rows = (await res.json()) as { slug: string }[];
    eventCache = { slugs: new Set([...eventSlugs, ...rows.map((r) => r.slug)]), at: Date.now() };
    return eventCache.slugs;
  } catch {
    return eventCache?.slugs ?? eventSlugs;
  }
}

export async function proxy(request: NextRequest) {
  const [, section, slug] = request.nextUrl.pathname.split("/");

  if (section === "panel") return panelGate(request);

  if (slug) {
    const known = section === "ekip" ? await memberSlugs() : await knownEventSlugs();
    if (!known.has(decode(slug) ?? "")) {
      return NextResponse.rewrite(new URL("/_bulunamadi", request.url));
    }
  }
}

/** Oturum çerezlerini yeniler; giriş yapılmamışsa giriş sayfasına yollar. */
async function panelGate(request: NextRequest) {
  if (!hasSupabase) return NextResponse.redirect(new URL("/giris", request.url));
  let response = NextResponse.next({ request });
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        for (const { name, value } of list) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of list) response.cookies.set(name, value, options);
      },
    },
  });
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    const url = new URL("/giris", request.url);
    url.searchParams.set("sonra", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return response;
}

/** Geçersiz yüzde kodlaması (ör. /ekip/%C3) hata fırlatıp 500 vermesin, 404'e düşsün. */
function decode(s: string): string | null {
  try {
    return decodeURIComponent(s);
  } catch {
    return null;
  }
}

export const config = { matcher: ["/ekip/:slug", "/etkinlikler/:slug", "/panel", "/panel/:path*"] };
