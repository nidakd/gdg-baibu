import type { ReactNode } from "react";

type SectionProps = {
  id?: string;
  /** Kod yorumu biçiminde küçük etiket, ör. "01 — biz kimiz" */
  label: string;
  title: ReactNode;
  intro?: ReactNode;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function Section({
  id,
  label,
  title,
  intro,
  action,
  className = "",
  children,
}: SectionProps) {
  return (
    <section id={id} className={`mx-auto max-w-content px-4 py-16 sm:px-6 md:py-20 ${className}`}>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl space-y-3">
          <p className="font-mono text-sm text-fg-subtle">{`// ${label}`}</p>
          <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">{title}</h2>
          {intro && <p className="text-lg text-fg-muted">{intro}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
