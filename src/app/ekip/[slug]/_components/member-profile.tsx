import { notFound } from "next/navigation";
import { Avatar } from "@/components/team/avatar";
import { MemberCard } from "@/components/team/member-card";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getMemberBySlug, getMembersByTeam } from "@/lib/content";

const linkLabels: Record<string, string> = {
  gdgCommunity: "GDG Community",
  linkedin: "LinkedIn",
  github: "GitHub",
  instagram: "Instagram",
  website: "Web sitesi",
};

export async function MemberProfile({ params }: Pick<PageProps<"/ekip/[slug]">, "params">) {
  const { slug } = await params;
  const member = getMemberBySlug(slug);
  if (!member) notFound();

  const teammates = getMembersByTeam(member.team.id).filter((m) => m.slug !== member.slug);
  const links = Object.entries(member.links).filter(([, url]) => url);

  return (
    <>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <Card tone={member.team.tone} className="flex flex-col items-start gap-6 p-6 md:p-10">
          <Avatar name={member.name} photoUrl={member.photoUrl} size={160} />
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">{member.name}</h1>
            <p className="text-lg">{member.role}</p>
            <p className="font-mono text-sm text-fg-muted">{member.team.name}</p>
          </div>
          <p className="max-w-prose text-fg-muted">
            {member.bio ?? "Bu profile henüz bir tanıtım yazısı eklenmedi."}
          </p>
          {links.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {links.map(([key, url]) => (
                <ButtonLink key={key} href={url} tone="plain">
                  {linkLabels[key] ?? key}
                </ButtonLink>
              ))}
            </div>
          )}
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b-2 border-border-strong bg-surface-2 px-5 py-3 font-mono text-sm">
            {member.slug}.json
          </div>
          <pre className="overflow-x-auto p-5 font-mono text-sm leading-relaxed">
            <code>
              {"{\n"}
              <JsonLine name="name" value={member.name} />
              <JsonLine name="role" value={member.role} />
              <JsonLine name="team" value={member.team.nameEn} />
              {member.department && <JsonLine name="department" value={member.department} />}
              {member.year && <JsonLine name="year" value={member.year} />}
              <JsonLine name="teammates" value={teammates.length} last />
              {"}"}
            </code>
          </pre>
        </Card>
      </div>

      {teammates.length > 0 && (
        <section className="mt-16">
          <p className="font-mono text-sm text-fg-subtle">{`// ${member.team.id}/`}</p>
          <h2 className="mt-2 mb-6 text-2xl font-bold">Ekip arkadaşları</h2>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {teammates.map((m) => (
              <li key={m.slug}>
                <MemberCard member={m} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function JsonLine({ name, value, last }: { name: string; value: string | number; last?: boolean }) {
  return (
    <>
      {"  "}
      <span className="text-syntax-keyword">&quot;{name}&quot;</span>:{" "}
      {typeof value === "number" ? (
        <span className="text-syntax-number">{value}</span>
      ) : (
        <span className="text-syntax-string">&quot;{value}&quot;</span>
      )}
      {last ? "" : ","}
      {"\n"}
    </>
  );
}
