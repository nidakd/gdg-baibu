"use server";

// Panel kullanıcıları (sadece admin; RLS de denetler). Admin kendini silemez ve rolünü düşüremez
// (panel adminsiz kalmasın).

import { redirect } from "next/navigation";
import { EMAIL, escapeHtml } from "@/lib/form-guard";
import { sendGmail } from "@/lib/gmail";
import { requirePanelUser } from "@/lib/panel/auth";
import { SITE_URL } from "@/lib/seo";

const back = (q: string) => redirect(`/panel/kullanicilar?${q}`);
const field = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

async function requireAdmin() {
  const session = await requirePanelUser("/panel/kullanicilar");
  if (session.user.role !== "admin") redirect("/panel");
  return session;
}

export async function addPanelUser(form: FormData) {
  const { supabase, user } = await requireAdmin();
  const email = field(form, "email").toLowerCase();
  const full_name = field(form, "full_name").replace(/\s+/g, " ").slice(0, 100) || null;
  const role = field(form, "role") === "admin" ? "admin" : "editor";
  if (!EMAIL.test(email) || email.length > 254) back("hata=eposta");

  const { error } = await supabase.from("panel_users").insert({ email, full_name, role });
  if (error?.code === "23505") back("hata=var");
  if (error) {
    console.error("[panel] kullanıcı eklenemedi", error.code);
    back("hata=kayit");
  }

  let invited = false;
  if (form.get("invite") === "on") {
    const first = full_name?.split(" ")[0] ?? "Merhaba";
    const link = `${SITE_URL}/giris`;
    invited = await sendGmail({
      to: email,
      subject: "GDG on Campus AİBÜ yönetim paneline eklendin",
      html: `
      <div style="font-family:sans-serif;font-size:15px;line-height:1.5;color:#202124">
        <p>${escapeHtml(first)},</p>
        <p>${escapeHtml(user.name ?? user.email)} seni GDG on Campus AİBÜ sitesinin yönetim paneline <strong>${role === "admin" ? "admin" : "editör"}</strong> olarak ekledi.</p>
        <p>Şifre yok: giriş sayfasına bu e-posta adresini yaz, gelen bağlantıyla giriş yap.</p>
        <p><a href="${link}" style="display:inline-block;background:#4285f4;color:#fff;padding:9px 16px;border-radius:999px;text-decoration:none;font-size:14px">Panele giriş</a></p>
      </div>`,
      text: `${first},\n\n${user.name ?? user.email} seni GDG on Campus AİBÜ yönetim paneline ${role === "admin" ? "admin" : "editör"} olarak ekledi.\n\nŞifre yok: ${link} adresinde bu e-postayı yaz, gelen bağlantıyla giriş yap.`,
    });
  }
  back(`eklendi=1${invited ? "&davet=1" : ""}`);
}

export async function updatePanelUser(form: FormData) {
  const { supabase, user } = await requireAdmin();
  const email = field(form, "email").toLowerCase();
  if (!EMAIL.test(email)) back("hata=eposta");
  if (form.get("remove") === "true") {
    if (email === user.email) back("hata=kendin");
    const { error } = await supabase.from("panel_users").delete().eq("email", email);
    if (error) console.error("[panel] kullanıcı silinemedi", error.code);
    back(error ? "hata=kayit" : "silindi=1");
  }
  const role = field(form, "role") === "admin" ? "admin" : "editor";
  if (email === user.email && role !== "admin") back("hata=kendin");
  const { error } = await supabase.from("panel_users").update({ role }).eq("email", email);
  if (error) console.error("[panel] rol değiştirilemedi", error.code);
  back(error ? "hata=kayit" : "guncellendi=1");
}
