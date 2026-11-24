import type { ReactNode } from "react";

/** Panelin sade kutusu: ince çerçeve, başlık satırı; sitedeki pencere süsleri yok. */
export function PanelBox({
  title,
  meta,
  titleAs: Title = "h2",
  className = "",
  children,
}: {
  title?: ReactNode;
  meta?: ReactNode;
  titleAs?: "h2" | "h3" | "span";
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`overflow-clip rounded-2xl border-2 border-border bg-surface ${className}`}>
      {(title || meta) && (
        <div className="flex items-center justify-between gap-3 border-b-2 border-border px-5 py-3">
          {title && <Title className="truncate font-bold">{title}</Title>}
          {meta && <span className="shrink-0 text-sm text-fg-subtle">{meta}</span>}
        </div>
      )}
      {children}
    </section>
  );
}
