import type { ReactNode } from "react";

type TerminalProps = {
  title?: string;
  children: ReactNode;
};

export function Terminal({ title = "~/gdg-aibu", children }: TerminalProps) {
  return (
    <div className="overflow-hidden rounded-card border border-border bg-surface shadow-sm">
      <div className="flex items-center gap-3 border-b border-border bg-surface-2 px-4 py-2.5">
        <span aria-hidden className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-red" />
          <span className="size-2.5 rounded-full bg-yellow" />
          <span className="size-2.5 rounded-full bg-green" />
        </span>
        <span className="font-mono text-xs text-fg-subtle">{title}</span>
      </div>
      <div className="space-y-1.5 p-5 font-mono text-sm leading-relaxed">{children}</div>
    </div>
  );
}

export function Prompt({ children }: { children: ReactNode }) {
  return (
    <p>
      <span className="text-green">$</span> {children}
    </p>
  );
}

export function Cursor() {
  return <span aria-hidden className="ml-0.5 inline-block h-4 w-2 animate-blink bg-fg align-middle" />;
}
