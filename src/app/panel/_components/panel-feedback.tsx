"use client";

// Panelde tıklamanın işe yaradığı belli olsun: sayfa geçişinde üstte ilerleme çubuğu, form
// gönderilirken basılan düğmede "işleniyor" görünümü. Yeni adres gelince ikisi de kalkar.

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function PanelFeedback() {
  const pathname = usePathname();
  const search = useSearchParams();
  // Çubuk, tıklandığı andaki adreste kaldıkça görünür; yeni adres gelince kendiliğinden kalkar
  const here = `${pathname}?${search.toString()}`;
  const [busyAt, setBusyAt] = useState<string | null>(null);
  const busy = busyAt === here;

  useEffect(() => {
    document.querySelectorAll("[data-pending]").forEach((el) => el.removeAttribute("data-pending"));
  }, [pathname, search]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const start = () => {
      setBusyAt(`${location.pathname}?${location.search.slice(1)}`);
      clearTimeout(timer);
      // Adres değişmeyen işlemler (ör. arkada kaydedilen seçim) çubuğu sonsuza bırakmasın
      timer = setTimeout(() => {
        setBusyAt(null);
        document
          .querySelectorAll("[data-pending]")
          .forEach((el) => el.removeAttribute("data-pending"));
      }, 8000);
    };
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as Element).closest("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (
        url.origin !== location.origin ||
        url.pathname.endsWith(".csv") ||
        url.href === location.href
      )
        return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      start();
    };
    const onSubmit = (e: SubmitEvent) => {
      const button = e.submitter ?? (e.target as HTMLFormElement).querySelector("[type=submit]");
      button?.setAttribute("data-pending", "");
      start();
    };
    document.addEventListener("click", onClick);
    document.addEventListener("submit", onSubmit);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", onClick);
      document.removeEventListener("submit", onSubmit);
    };
  }, []);

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 h-1 overflow-hidden transition-opacity duration-300 ${busy ? "opacity-100" : "opacity-0"}`}
    >
      <div className="panel-progress h-full w-1/3 rounded-full bg-blue" />
    </div>
  );
}
