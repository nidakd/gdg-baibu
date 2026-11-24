// Panel yetkisi. Her panel sayfası ve işlemi requirePanelUser() ile başlar:
// giriş yoksa /giris'e, e-posta panel_users'ta değilse yetkisiz uyarısına yollar.
// Veritabanı da (RLS) aynı kuralı ayrıca uygular; burası sadece doğru sayfayı göstermek için.

import { redirect } from "next/navigation";
import { cache } from "react";
import { serverClient } from "@/lib/supabase/server";

export type PanelRole = "admin" | "editor";
export type PanelUser = { email: string; name: string | null; role: PanelRole };

/** Bir istekte bir kez okunur (yerleşim ve sayfa aynı sonucu paylaşır). */
export const getPanelSession = cache(async () => {
  const supabase = await serverClient();
  const { data } = await supabase.auth.getClaims();
  const email = typeof data?.claims?.email === "string" ? data.claims.email.toLowerCase() : null;
  if (!email) return { supabase, user: null, signedIn: false } as const;
  const { data: row } = await supabase
    .from("panel_users")
    .select("email,full_name,role")
    .eq("email", email)
    .maybeSingle();
  const user: PanelUser | null = row
    ? { email: row.email, name: row.full_name, role: row.role as PanelRole }
    : null;
  return { supabase, user, signedIn: true } as const;
});

export async function requirePanelUser(path = "/panel") {
  const session = await getPanelSession();
  if (!session.signedIn) redirect(`/giris?sonra=${encodeURIComponent(path)}`);
  if (!session.user) redirect("/giris?hata=yetki");
  return { supabase: session.supabase, user: session.user };
}

/** Giriş sonrası dönülecek adres: sadece panelin kendi sayfaları (açık yönlendirme olmasın). */
export function safeNext(value: string | null | undefined): string {
  return value && /^\/panel(\/[a-z0-9/-]*)?$/.test(value) ? value : "/panel";
}
