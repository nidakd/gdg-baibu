"use client";

import { useEffect, useState } from "react";

/**
 * Panele giriş yapmış kişiye sitedeki profilde "Panelde düzenle" butonu.
 * Ziyaretçilerde Supabase oturum çerezi olmadığı için hiçbir istek atılmaz.
 */
export function EditInPanel({ slug }: { slug: string }) {
  const [editor, setEditor] = useState(false);

  useEffect(() => {
    if (!document.cookie.includes("-auth-token")) return;
    let cancelled = false;
    fetch("/api/panel/ben", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { editor: false }))
      .then((d: { editor?: boolean }) => {
        if (!cancelled) setEditor(Boolean(d.editor));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!editor) return null;
  return (
    <a
      href={`/panel/ekip/duzenle?slug=${encodeURIComponent(slug)}`}
      className="inline-flex items-center gap-2 rounded-full border-2 border-dashed border-border-strong px-4 py-2 text-sm font-medium hover:bg-surface-2"
    >
      ✎ Panelde düzenle
    </a>
  );
}
