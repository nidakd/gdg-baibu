import Link from "next/link";
import { requirePanelUser } from "@/lib/panel/auth";
import { EventForm } from "../event-form";

export const metadata = { title: "Yeni etkinlik" };

export default async function NewEvent() {
  await requirePanelUser("/panel/etkinlikler/yeni");
  return (
    <div className="space-y-6">
      <Link href="/panel/etkinlikler" className="inline-block text-sm text-fg-muted hover:text-fg">
        ← Etkinlikler
      </Link>
      <h1 className="text-3xl font-bold tracking-tight">Yeni etkinlik</h1>
      <p className="max-w-prose text-fg-muted">
        GDG Community&apos;de olan etkinlikler her pazartesi kendiliğinden gelir; burayı sadece
        orada olmayan etkinlikler (atölye, iç toplantı vb.) için kullan. Kayıt varsayılan olarak
        sitedeki formla alınır, etkinlik kaydedilince &quot;Kayıt&quot; sayfasından
        değiştirilebilir.
      </p>
      <EventForm
        event={{
          title: "",
          date: "",
          start: "18:00",
          end: "20:00",
          format: "in-person",
          venue: "",
          summary: "",
          description: "",
          tags: "",
          cover_url: null,
          published: false,
        }}
      />
    </div>
  );
}
