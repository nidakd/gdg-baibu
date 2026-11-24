import { notFound } from "next/navigation";
import { requirePanelUser } from "@/lib/panel/auth";
import { MemberForm, type MemberValues } from "../member-form";

export const metadata = { title: "Üyeyi düzenle" };

export default async function EditMember({ searchParams }: PageProps<"/panel/ekip/duzenle">) {
  const { id: raw } = await searchParams;
  const id = typeof raw === "string" ? raw : "";
  const { supabase } = await requirePanelUser("/panel/ekip");
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const [{ data: teams }, { data: member }] = await Promise.all([
    supabase.from("teams").select("id,name").order("sort_order"),
    supabase
      .from("team_members")
      .select("id,slug,name,role,team_id,department,year,photo_url,bio,links,sort_order,active")
      .eq("id", id)
      .maybeSingle(),
  ]);
  if (!member) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold tracking-tight">{member.name}</h1>
      <MemberForm teams={teams ?? []} member={member as MemberValues} />
    </div>
  );
}
