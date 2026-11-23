// Var olmayan /ekip/[kişi] ve /etkinlikler/[etkinlik] adreslerini sayfa render edilmeden
// önce gerçek 404'e çevirir. Cache Components açıkken dynamicParams kullanılamadığı için
// gerekli; veriler Supabase'e taşınınca bu kontrol de oraya bakacak.

import { NextResponse, type NextRequest } from "next/server";
import eventsJson from "../content/events.json";
import teamJson from "../content/team.json";
import { slugify } from "./lib/slug";

const known: Record<string, Set<string>> = {
  ekip: new Set(teamJson.members.map((m) => slugify(m.name))),
  etkinlikler: new Set(eventsJson.map((e) => e.slug)),
};

export function proxy(request: NextRequest) {
  const [, section, slug] = request.nextUrl.pathname.split("/");
  if (slug && !known[section]?.has(decode(slug) ?? "")) {
    return NextResponse.rewrite(new URL("/_bulunamadi", request.url));
  }
}

/** Geçersiz yüzde kodlaması (ör. /ekip/%C3) hata fırlatıp 500 vermesin, 404'e düşsün. */
function decode(s: string): string | null {
  try {
    return decodeURIComponent(s);
  } catch {
    return null;
  }
}

export const config = { matcher: ["/ekip/:slug", "/etkinlikler/:slug"] };
