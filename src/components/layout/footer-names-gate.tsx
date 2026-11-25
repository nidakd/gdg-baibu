"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// Kısa sayfalarda isim şeridi çok yer kaplıyor: katılım formu ve onayı, kişi profilleri, etkinlik detayları.
// (404'te şerit hiç gönderilmez, bkz. SiteShell.)
const HIDDEN = [/^\/katil(\/onay)?\/?$/, /^\/ekip\/[^/]+\/?$/, /^\/etkinlikler\/[^/]+\/?$/];

/** İsim şeridini kısa sayfalarda gizler; gizlenince footer'ın üst boşluğu yine korunur. */
export function FooterNamesGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (HIDDEN.some((re) => re.test(pathname))) return <div className="mt-16" />;
  return <div className="mt-16 mb-6">{children}</div>;
}
