import { PanelBox } from "@/app/panel/_components/panel-box";
import { getSite } from "@/lib/content";
import { requirePanelUser } from "@/lib/panel/auth";
import { getSiteOverrides } from "@/lib/settings";
import { saveSiteSettings } from "./actions";

export const metadata = { title: "Site ayarları" };

const input =
  "w-full rounded-xl border-2 border-border-strong bg-surface px-3 py-2.5 text-base outline-none focus-visible:ring-2 focus-visible:ring-blue";

const ERRORS: Record<string, string> = {
  yetki: "Site ayarlarını sadece admin değiştirebilir.",
  link: "Bağlantılar https:// ile başlamalı.",
  kayit: "Kaydedilemedi, tekrar dene.",
};

/** Hakkımızda metni ve sosyal bağlantılar. Boş alan site.json'daki varsayılanı kullanır. */
export default async function SiteSettings({ searchParams }: PageProps<"/panel/ayarlar">) {
  const { user } = await requirePanelUser("/panel/ayarlar");
  const { kaydedildi, hata } = await searchParams;
  const base = getSite();
  const o = await getSiteOverrides();
  const isAdmin = user.role === "admin";

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Site ayarları</h1>
        <p className="max-w-prose text-fg-muted">
          Ana sayfa ve hakkımızdaki tanıtım metni, sosyal bağlantılar. Bir alanı boşaltırsan
          varsayılan metne döner. Topluluk üye sayısı GDG Community&apos;den her pazartesi
          kendiliğinden güncellenir; başvuru dönemi Başvurular sayfasında.
        </p>
      </header>
      {kaydedildi && (
        <p role="status" className="rounded-xl bg-green-soft px-4 py-3 text-sm">
          Kaydedildi; sitede birkaç saniye içinde görünür.
        </p>
      )}
      {typeof hata === "string" && ERRORS[hata] && (
        <p role="alert" className="rounded-xl bg-red-soft px-4 py-3 text-sm">
          {ERRORS[hata]}
        </p>
      )}

      <form action={saveSiteSettings} className="space-y-6">
        <fieldset disabled={!isAdmin} className="space-y-6">
          <PanelBox title="Tanıtım metni">
            <div className="space-y-5 p-5 sm:p-6">
              <Field label="Başlık (hakkımızda)" htmlFor="about_title">
                <input
                  id="about_title"
                  name="about_title"
                  maxLength={120}
                  defaultValue={o.about?.title ?? ""}
                  placeholder={base.about.title}
                  className={input}
                />
              </Field>
              <Field label="Giriş cümlesi (ana sayfa + hakkımızda)" htmlFor="about_intro">
                <textarea
                  id="about_intro"
                  name="about_intro"
                  rows={2}
                  maxLength={400}
                  defaultValue={o.about?.intro ?? ""}
                  placeholder={base.about.intro}
                  className={`${input} resize-y`}
                />
              </Field>
              <Field label="Paragraflar (hakkımızda; boş satırla ayır)" htmlFor="paragraphs">
                <textarea
                  id="paragraphs"
                  name="paragraphs"
                  rows={7}
                  defaultValue={(o.about?.paragraphs ?? []).join("\n\n")}
                  placeholder={base.about.paragraphs.join("\n\n")}
                  className={`${input} resize-y`}
                />
              </Field>
            </div>
          </PanelBox>
          <PanelBox title="Sosyal bağlantılar">
            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
              {(["instagram", "linkedin", "whatsapp", "linktree"] as const).map((k) => (
                <Field
                  key={k}
                  label={k === "whatsapp" ? "WhatsApp topluluğu" : k[0].toUpperCase() + k.slice(1)}
                  htmlFor={`link_${k}`}
                >
                  <input
                    id={`link_${k}`}
                    name={`link_${k}`}
                    type="url"
                    defaultValue={o.links?.[k] ?? ""}
                    placeholder={base.links[k]}
                    className={input}
                  />
                </Field>
              ))}
            </div>
          </PanelBox>
        </fieldset>
        {isAdmin ? (
          <button
            type="submit"
            className="rounded-full border-2 border-border-strong bg-green px-5 py-2.5 text-sm font-medium text-ink-black"
          >
            Kaydet
          </button>
        ) : (
          <p className="text-sm text-fg-subtle">Değiştirmek için admin yetkisi gerekir.</p>
        )}
      </form>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block font-mono text-xs text-fg-subtle">
        {label}
      </label>
      {children}
    </div>
  );
}
