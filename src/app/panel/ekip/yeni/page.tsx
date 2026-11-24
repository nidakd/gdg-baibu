import Link from "next/link";
import { requirePanelUser } from "@/lib/panel/auth";
import { MemberForm } from "../member-form";

export const metadata = { title: "Yeni üye" };

export default async function NewMember() {
  const { supabase } = await requirePanelUser("/panel/ekip/yeni");
  const { data: teams } = await supabase.from("teams").select("id,name").order("sort_order");
  return (
    <div className="space-y-6">
      <Link href="/panel/ekip" className="inline-block text-sm text-fg-muted hover:text-fg">
        ← Ekip
      </Link>
      <h1 className="text-3xl font-bold tracking-tight">Yeni üye</h1>
      <MemberForm
        teams={teams ?? []}
        member={{
          name: "",
          role: "Ekip Üyesi",
          team_id: teams?.[1]?.id ?? "",
          department: null,
          year: null,
          photo_url: null,
          bio: null,
          links: {},
          sort_order: 100,
          active: true,
        }}
      />
    </div>
  );
}
