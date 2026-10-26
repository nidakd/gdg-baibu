import type { ReactNode } from "react";
import type { Tone } from "./button";

// Marka rehberinin pencere kartları: pastel üst çubuk, üç halftone daire, koyu çerçeve.
// Etkinlik arşivinin yılları ve ekip sayfasının ekipleri bu bileşenle çizilir.

const bars: Record<Tone, string> = {
  blue: "bg-blue-soft",
  green: "bg-green-soft",
  yellow: "bg-yellow-soft",
  red: "bg-red-soft",
  lilac: "bg-lilac-soft",
  silver: "bg-silver-soft",
};

type WindowProps = {
  /** Üst çubuktaki yol, ör. "~/team/software" */
  title: ReactNode;
  /** Üst çubuğun sağındaki küçük bilgi */
  meta?: ReactNode;
  tone?: Tone;
  /** Kaydırırken üst çubuk header'ın altında yapışık kalsın */
  sticky?: boolean;
  titleId?: string;
  /** Başlığın etiketi; sayfa yapısında başlık olacaksa h2/h3 */
  titleAs?: "h2" | "h3" | "span";
  className?: string;
  children: ReactNode;
};

export function Window({
  title,
  meta,
  tone = "blue",
  sticky,
  titleId,
  titleAs: Title = "span",
  className = "",
  children,
}: WindowProps) {
  return (
    <div
      className={`overflow-clip rounded-card border-2 border-border-strong bg-surface shadow-sticker ${className}`}
    >
      <div
        className={`flex items-center justify-between gap-3 border-b-2 border-border-strong px-4 py-2.5 font-mono text-sm ${bars[tone]} ${sticky ? "sticky top-16 z-10" : ""}`}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span aria-hidden className="flex shrink-0 gap-1.5">
            <span className="size-3 rounded-full border-[1.5px] border-ink-black bg-red-halftone" />
            <span className="size-3 rounded-full border-[1.5px] border-ink-black bg-yellow-halftone" />
            <span className="size-3 rounded-full border-[1.5px] border-ink-black bg-green-halftone" />
          </span>
          <Title id={titleId} className="truncate font-bold">
            {title}
          </Title>
        </span>
        {meta && <span className="shrink-0 text-fg-subtle">{meta}</span>}
      </div>
      {children}
    </div>
  );
}
