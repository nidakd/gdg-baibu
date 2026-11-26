import type { Metadata } from "next";
import { getSite } from "@/lib/content";
import { openGraph } from "@/lib/seo";

// Aydınlatma metni (KVKK md. 10), en kısa hâli. İçerik değişince UPDATED'i güncelle.

const UPDATED = "27 Kasım 2026";

const description = "GDG on Campus AİBÜ sitesinde kişisel bilgilerini nasıl kullandığımız.";

export const metadata: Metadata = {
  title: "Gizlilik",
  description,
  openGraph: openGraph({ title: "Gizlilik", description, path: "/gizlilik" }),
};

export default function PrivacyPage() {
  const site = getSite();
  const items = [
    "Sadece formlara yazdıklarını tutuyoruz: iletişim, başvuru ve etkinlik kaydı.",
    "Bunları yalnızca sana dönmek, başvurunu değerlendirmek ve etkinliği düzenlemek için kullanıyoruz.",
    "Bilgilerini kulüp yönetimi görür; kimseyle paylaşmayız, satmayız.",
    "Site Vercel, Supabase ve Google altyapısında çalışır; bilgiler yurt dışındaki sunucularda saklanır.",
    "Reklam ve takip çerezi yok.",
  ];
  return (
    <article className="mx-auto max-w-2xl space-y-8 px-4 py-12 sm:px-6 md:py-20">
      <header className="space-y-3">
        <p className="font-mono text-sm text-fg-subtle">{`// gizlilik · ${UPDATED}`}</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Gizlilik</h1>
      </header>
      <ul className="space-y-3 text-lg leading-relaxed">
        {items.map((t) => (
          <li key={t} className="flex gap-3">
            <span aria-hidden className="font-mono text-green-ink">
              →
            </span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
      <p className="rounded-2xl border-2 border-border-strong bg-surface p-5 leading-relaxed">
        Bilgilerini görmek, düzeltmek ya da sildirmek istersen{" "}
        <a href={`mailto:${site.email}`} className="font-medium underline">
          {site.email}
        </a>{" "}
        adresine yaz.
      </p>
      <p className="text-sm text-fg-subtle">Veri sorumlusu: {site.shortName} yönetimi.</p>
    </article>
  );
}
