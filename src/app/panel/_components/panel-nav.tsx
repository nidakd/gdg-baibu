import Link from "next/link";
import { signOut } from "@/app/giris/actions";
import { requirePanelUser } from "@/lib/panel/auth";

const links = [
  { href: "/panel", label: "özet" },
  { href: "/panel/ekip", label: "ekip" },
  { href: "/panel/mesajlar", label: "mesajlar" },
];

/** Panelin üst çubuğu: bölümler, giriş yapan kişi, çıkış. */
export async function PanelNav() {
  const { user } = await requirePanelUser();
  return (
    <nav
      aria-label="Panel"
      className="flex flex-wrap items-center justify-between gap-4 rounded-card border-2 border-border-strong bg-surface-2 px-4 py-3 font-mono text-sm shadow-sticker-sm"
    >
      <ul className="flex flex-wrap items-center gap-1">
        <li className="mr-2 font-bold">~/panel</li>
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="rounded-full px-3 py-1.5 hover:bg-surface">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
      <form action={signOut} className="flex items-center gap-3">
        <span className="text-fg-subtle">
          {user.name ?? user.email} · {user.role}
        </span>
        <button
          type="submit"
          className="rounded-full border-2 border-border-strong px-3 py-1 hover:bg-surface"
        >
          çıkış
        </button>
      </form>
    </nav>
  );
}
