"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/giris/actions";

const links = [
  { href: "/panel", label: "Özet", icon: "◎" },
  { href: "/panel/ekip", label: "Ekip", icon: "☺" },
  { href: "/panel/etkinlikler", label: "Etkinlikler", icon: "◆" },
  { href: "/panel/basvurular", label: "Başvurular", icon: "✦" },
  { href: "/panel/mesajlar", label: "Mesajlar", icon: "✉" },
  { href: "/panel/icerik", label: "İçerik", icon: "¶" },
  { href: "/panel/ayarlar", label: "Site ayarları", icon: "⚙" },
];
/** Sadece adminin menüsünde */
const adminLinks = [{ href: "/panel/girisler", label: "Son girişler", icon: "⌘" }];

/** Menü bağlantıları; bulunulan bölüm vurgulanır. Telefonda yatay kayar, çıkış da burada. */
export function PanelLinks({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/panel" ? pathname === "/panel" : pathname.startsWith(href);
  return (
    <nav aria-label="Panel" className="overflow-x-auto px-2 pb-2 lg:px-3 lg:pb-0">
      <ul className="flex gap-1 lg:flex-col">
        {(isAdmin ? [...links, ...adminLinks] : links).map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 whitespace-nowrap ${
                isActive(l.href) ? "bg-blue-soft font-bold" : "hover:bg-surface"
              }`}
            >
              <span aria-hidden className="w-4 text-center text-fg-subtle">
                {l.icon}
              </span>
              {l.label}
            </Link>
          </li>
        ))}
        <li className="lg:hidden">
          <form action={signOut}>
            <button type="submit" className="rounded-xl px-3 py-2 whitespace-nowrap text-fg-subtle">
              Çıkış
            </button>
          </form>
        </li>
      </ul>
    </nav>
  );
}
