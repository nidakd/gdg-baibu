import type { Metadata } from "next";
import { Suspense } from "react";
import { getSite, getWorkingTeams } from "@/lib/content";
import { openGraph } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { Window } from "@/components/ui/window";
import { JoinForm } from "./join-form";

const description =
  "GDG on Campus AİBÜ core team'ine başvur: yazılım, tasarım, etkinlik, sponsorluk ya da sosyal medya ekibi.";

export const metadata: Metadata = {
  title: "Aramıza katıl",
  description,
  openGraph: openGraph({ title: "Aramıza katıl", description, path: "/katil" }),
};

export default async function JoinPage({ searchParams }: PageProps<"/katil">) {
  const teams = await getWorkingTeams();
  const site = getSite();
  return (
    <div className="mx-auto grid max-w-content gap-12 px-4 py-12 sm:px-6 md:py-20 lg:grid-cols-[1fr_1.3fr] lg:items-start">
      <div className="space-y-5 lg:sticky lg:top-24">
        <p className="font-mono text-sm text-fg-subtle">{"// git checkout -b sen"}</p>
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">Aramıza katıl</h1>
        <p className="text-lg text-fg-muted">
          Etkinlikleri planlayan, afişleri tasarlayan, atölyeleri hazırlayan ekibin parçası ol.
          Hangi bölümden ya da sınıftan olduğun fark etmez; merak etmen yeter.
        </p>
        <ul className="space-y-2 text-fg-muted">
          <li>→ Formu doldur, ilgilendiğin ekipleri seç.</li>
          <li>→ Ekipten biri e-postayla dönüp kısa bir tanışma ayarlar.</li>
          <li>
            → Sorun varsa:{" "}
            <a href={`mailto:${site.email}`} className="underline hover:no-underline">
              {site.email}
            </a>
          </li>
        </ul>
      </div>
      <Suspense>
        <Closable>
          <FormWithParams
            teams={teams.map((t) => ({ id: t.id, name: t.name, tone: t.tone }))}
            searchParams={searchParams}
          />
        </Closable>
      </Suspense>
    </div>
  );
}

async function FormWithParams({
  teams,
  searchParams,
}: {
  teams: { id: string; name: string; tone: string }[];
} & Pick<PageProps<"/katil">, "searchParams">) {
  const { ekip } = await searchParams;
  const preselected = typeof ekip === "string" && teams.some((t) => t.id === ekip) ? ekip : null;
  return <JoinForm teams={teams} preselected={preselected} />;
}

/** Başvuru dönemi panelden kapatıldıysa form yerine not görünür. */
async function Closable({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  if (settings.applicationsOpen) return children;
  return (
    <Window title="~/katil/basvuru.json" tone="silver" meta="kapalı">
      <div className="space-y-2 p-6" role="status">
        <p className="font-mono text-sm text-fg-subtle">403 · başvuru dönemi kapalı</p>
        <p className="text-base">{settings.applicationsClosedNote}</p>
      </div>
    </Window>
  );
}
