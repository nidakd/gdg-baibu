// Var olmayan /ekip/[kişi] adreslerini sayfa render edilmeden önce gerçek 404'e çevirir.
// Cache Components açıkken dynamicParams kullanılamadığı için gerekli; ekip Supabase'e
// taşınınca bu kontrol de oraya bakacak.

import { NextResponse, type NextRequest } from "next/server";
import teamJson from "../content/team.json";
import { slugify } from "./lib/slug";

const known = new Set(teamJson.members.map((m) => slugify(m.name)));

export function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.split("/")[2];
  if (slug && !known.has(decodeURIComponent(slug))) {
    return NextResponse.rewrite(new URL("/_bulunamadi", request.url));
  }
}

export const config = { matcher: "/ekip/:slug" };
