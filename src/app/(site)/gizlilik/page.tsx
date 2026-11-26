import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getSite } from "@/lib/content";
import { openGraph } from "@/lib/seo";

// KVKK md. 10 aydınlatma metni, kısa hâli. İçerik değişince UPDATED'i güncelle.

const UPDATED = "27 Kasım 2026";

const description =
  "GDG on Campus AİBÜ sitesinde hangi bilgileri, ne için ve ne kadar süre tuttuğumuz; haklarınız.";

export const metadata: Metadata = {
  title: "Gizlilik",
  description,
  openGraph: openGraph({ title: "Gizlilik", description, path: "/gizlilik" }),
};

const rows: [string, string, string][] = [
  ["İletişim formu", "ad, e-posta, mesaj", "1 yıl"],
  ["Aramıza katıl", "başvuruda yazdıkların", "dönem sonu"],
  ["Etkinlik kaydı", "ad, e-posta, bölüm", "etkinlikten 3 ay sonra"],
  ["Panel girişi (ekip)", "e-posta, cihaz türü", "90 gün"],
];

export default function PrivacyPage() {
  const site = getSite();
  const mail = (
    <a href={`mailto:${site.email}`} className="font-medium underline">
      {site.email}
    </a>
  );
  return (
    <article className="mx-auto max-w-2xl space-y-10 px-4 py-12 sm:px-6 md:py-20">
      <header className="space-y-3">
        <p className="font-mono text-sm text-fg-subtle">{`// gizlilik · ${UPDATED}`}</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Gizlilik</h1>
        <p className="text-lg text-fg-muted">
          Sadece formlara yazdıklarını, sadece sana dönmek için tutuyoruz. Reklam ve takip çerezi
          yok, bilgilerin satılmaz ya da paylaşılmaz.
        </p>
      </header>

      <div className="overflow-hidden rounded-2xl border-2 border-border-strong">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-2 font-mono text-xs text-fg-subtle">
            <tr>
              <th className="px-4 py-2.5 font-normal">nerede</th>
              <th className="px-4 py-2.5 font-normal">ne</th>
              <th className="px-4 py-2.5 font-normal">ne kadar</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-border">
            {rows.map(([where, what, keep]) => (
              <tr key={where}>
                <td className="px-4 py-3 font-medium">{where}</td>
                <td className="px-4 py-3 text-fg-muted">{what}</td>
                <td className="px-4 py-3">{keep}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dl className="space-y-6">
        <Item term="Kim görür?">
          Sadece kulübün yönetim ekibi. Site Vercel, Supabase (Almanya) ve Google altyapısında
          çalışır; bilgiler bu yüzden yurt dışındaki sunucularda saklanır.
        </Item>
        <Item term="Neye dayanarak?">
          Başvuru ve etkinlik kaydında onay kutusuyla verdiğin açık rızaya, iletişim formunda
          mesajına yanıt verme ihtiyacına (KVKK md. 5).
        </Item>
        <Item term="Hakların">
          Bilgilerini görmek, düzeltmek ya da sildirmek için {mail} adresine yaz; en geç 30 gün
          içinde yanıtlarız. Onayını istediğin zaman geri alabilirsin (KVKK md. 11).
        </Item>
        <Item term="Veri sorumlusu">
          {site.name} öğrenci topluluğu yönetimi, {mail}.
        </Item>
      </dl>
    </article>
  );
}

function Item({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="font-bold">{term}</dt>
      <dd className="leading-relaxed text-fg-muted">{children}</dd>
    </div>
  );
}
