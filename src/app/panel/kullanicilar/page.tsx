import { redirect } from "next/navigation";
import { PanelBox } from "@/app/panel/_components/panel-box";
import { formatDate } from "@/lib/format";
import { requirePanelUser } from "@/lib/panel/auth";
import { addPanelUser, updatePanelUser } from "./actions";

export const metadata = { title: "Kullanıcılar" };

type Row = {
  email: string;
  full_name: string | null;
  role: "admin" | "editor";
  created_at: string;
};

const input =
  "w-full rounded-xl border-2 border-border-strong bg-surface px-3 py-2.5 text-base outline-none focus-visible:ring-2 focus-visible:ring-blue";

const MESSAGES: Record<string, [string, string]> = {
  eklendi: ["Eklendi.", "ok"],
  guncellendi: ["Rol güncellendi.", "ok"],
  silindi: ["Erişim kaldırıldı.", "ok"],
};
const ERRORS: Record<string, string> = {
  eposta: "Geçerli bir e-posta adresi yaz.",
  var: "Bu adres zaten panelde.",
  kendin: "Kendi erişimini kaldıramaz ya da admin rolünü bırakamazsın (panel adminsiz kalmasın).",
  kayit: "Kaydedilemedi, tekrar dene.",
};

/** Panel kullanıcıları: davet et, rol değiştir, erişimi kaldır (sadece admin). */
export default async function PanelUsers({ searchParams }: PageProps<"/panel/kullanicilar">) {
  const { supabase, user } = await requirePanelUser("/panel/kullanicilar");
  if (user.role !== "admin") redirect("/panel");
  const params = await searchParams;
  const { data } = await supabase
    .from("panel_users")
    .select("email,full_name,role,created_at")
    .order("created_at");
  const rows = (data ?? []) as Row[];
  const ok = Object.keys(MESSAGES).find((k) => params[k]);
  const err = typeof params.hata === "string" ? ERRORS[params.hata] : undefined;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Kullanıcılar</h1>
        <p className="max-w-prose text-fg-muted">
          Panele kimlerin girebileceği. <strong>Editör</strong> ekip, etkinlik, içerik ve
          başvurularla çalışır; <strong>admin</strong> ayrıca siler, site ayarlarını ve
          kullanıcıları yönetir. Giriş şifresiz: eklenen kişi giriş sayfasına kendi e-postasını
          yazar.
        </p>
      </header>
      {ok && (
        <p role="status" className="rounded-xl bg-green-soft px-4 py-3 text-sm">
          {MESSAGES[ok][0]}
          {params.davet && " Davet e-postası gönderildi."}
        </p>
      )}
      {err && (
        <p role="alert" className="rounded-xl bg-red-soft px-4 py-3 text-sm">
          {err}
        </p>
      )}

      <PanelBox title="~/panel/kullanicilar" meta={`${rows.length} kişi`}>
        <ul className="divide-y-2 divide-border">
          {rows.map((r) => (
            <li
              key={r.email}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
            >
              <div className="min-w-0">
                <p className="font-medium">
                  {r.full_name ?? r.email}
                  {r.email === user.email && (
                    <span className="ml-2 font-mono text-xs text-fg-subtle">sen</span>
                  )}
                </p>
                <p className="text-sm break-all text-fg-muted">
                  {r.email} · {formatDate(r.created_at)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <form action={updatePanelUser} className="flex items-center gap-2">
                  <input type="hidden" name="email" value={r.email} />
                  <select
                    name="role"
                    defaultValue={r.role}
                    aria-label={`${r.email} rolü`}
                    className="rounded-xl border-2 border-border bg-surface px-2 py-1 text-sm"
                  >
                    <option value="editor">editör</option>
                    <option value="admin">admin</option>
                  </select>
                  <button
                    type="submit"
                    className="rounded-full border-2 border-border px-3 py-1 text-sm hover:bg-surface-2"
                  >
                    Kaydet
                  </button>
                </form>
                {r.email !== user.email && (
                  <form action={updatePanelUser}>
                    <input type="hidden" name="email" value={r.email} />
                    <input type="hidden" name="remove" value="true" />
                    <button
                      type="submit"
                      className="rounded-full px-3 py-1 text-sm text-red-ink underline"
                    >
                      Erişimi kaldır
                    </button>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      </PanelBox>

      <PanelBox title="Kullanıcı ekle">
        <form action={addPanelUser} className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <label className="space-y-1.5">
            <span className="block font-mono text-xs text-fg-subtle">E-posta</span>
            <input name="email" type="email" required className={input} />
          </label>
          <label className="space-y-1.5">
            <span className="block font-mono text-xs text-fg-subtle">Ad soyad</span>
            <input name="full_name" maxLength={100} className={input} />
          </label>
          <label className="space-y-1.5">
            <span className="block font-mono text-xs text-fg-subtle">Rol</span>
            <select name="role" defaultValue="editor" className={input}>
              <option value="editor">editör</option>
              <option value="admin">admin</option>
            </select>
          </label>
          <label className="flex items-center gap-3 self-end pb-3 text-sm">
            <input type="checkbox" name="invite" defaultChecked className="size-4" />
            Davet e-postası gönder
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-full border-2 border-border-strong bg-green px-5 py-2.5 text-sm font-medium text-ink-black"
            >
              Ekle
            </button>
          </div>
        </form>
      </PanelBox>
    </div>
  );
}
