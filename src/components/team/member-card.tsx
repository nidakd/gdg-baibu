import Link from "next/link";
import type { Member } from "@/lib/content";
import { Avatar } from "./avatar";

export function MemberCard({ member }: { member: Member }) {
  return (
    <Link
      href={`/ekip/${member.slug}`}
      className="group flex h-full items-center gap-4 rounded-card border-2 border-border-strong bg-surface p-4 shadow-sticker-sm transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-sticker"
    >
      <Avatar name={member.name} photoUrl={member.photoUrl} size={64} />
      <span className="min-w-0">
        <span className="block font-bold group-hover:underline">{member.name}</span>
        <span className="block text-sm text-fg-muted">{member.role}</span>
        <span className="mt-1 block truncate font-mono text-xs text-fg-subtle">
          {member.team.name}
        </span>
      </span>
    </Link>
  );
}
