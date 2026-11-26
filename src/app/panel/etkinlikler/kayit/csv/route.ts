import { getPanelSession } from "@/lib/panel/auth";

/** Bir etkinliğin kayıtları CSV olarak (Excel'de Türkçe karakterler bozulmasın diye BOM ve ;). */
export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("e") ?? "";
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}-[a-z0-9-]+$/.test(slug))
    return new Response("Geçersiz", { status: 400 });
  const { supabase, user } = await getPanelSession();
  if (!user) return new Response("Yetki yok", { status: 403 });
  const { data, error } = await supabase
    .from("registrations")
    .select("name,email,department,created_at,cancelled_at")
    .eq("event_slug", slug)
    .order("created_at");
  if (error) return new Response("Okunamadı", { status: 500 });
  // Hücre = ile başlıyorsa Excel formül sanmasın
  const cell = (v: string | null) => {
    const s = (v ?? "").replace(/"/g, '""');
    return `"${/^[=+\-@]/.test(s) ? `'${s}` : s}"`;
  };
  const lines = [
    ["Ad soyad", "E-posta", "Bölüm", "Kayıt zamanı", "Durum"].map(cell).join(";"),
    ...(data ?? []).map((r) =>
      [
        r.name,
        r.email,
        r.department,
        new Date(r.created_at).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" }),
        r.cancelled_at ? "iptal" : "kayıtlı",
      ]
        .map(cell)
        .join(";"),
    ),
  ];
  return new Response(`﻿${lines.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="kayitlar-${slug}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
