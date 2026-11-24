import { signOut } from "@/app/giris/actions";
import { Logo } from "@/components/brand/logo";
import { requirePanelUser } from "@/lib/panel/auth";
import { PanelLinks } from "./panel-links";

/**
 * Panelin menüsü: masaüstünde solda sabit yan menü, telefonda üstte yatay şerit.
 * Giriş yapan kişi ve çıkış en altta.
 */
export async function PanelSidebar() {
  const { user } = await requirePanelUser();
  return (
    <aside className="border-b-2 border-border-strong bg-surface-2 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:border-r-2 lg:border-b-0">
      <div className="flex items-center justify-between gap-3 px-4 py-3 lg:block lg:px-5 lg:py-6">
        <Logo className="h-6" href="/panel" label="panel" />
        <p className="font-mono text-xs text-fg-subtle lg:mt-2">~/panel</p>
      </div>

      <PanelLinks />

      <div className="hidden space-y-3 border-t-2 border-border px-5 py-5 text-sm lg:mt-auto lg:block">
        <p className="truncate font-medium" title={user.email}>
          {user.name ?? user.email}
        </p>
        <p className="font-mono text-xs text-fg-subtle">{user.role}</p>
        <div className="flex flex-wrap gap-2">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border-2 border-border-strong px-3 py-1 hover:bg-surface"
          >
            siteyi aç ↗
          </a>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-full border-2 border-border-strong px-3 py-1 hover:bg-surface"
            >
              çıkış
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
