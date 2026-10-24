import type { ReactNode } from "react";

type TerminalProps = {
  title?: string;
  children: ReactNode;
};

export function Terminal({ title = "~/gdg-aibu", children }: TerminalProps) {
  return (
    <div className="overflow-hidden rounded-card border-2 border-border-strong bg-surface shadow-sticker-lg">
      <div className="flex items-center gap-3 border-b-2 border-border-strong bg-blue-soft px-4 py-2.5">
        <span aria-hidden className="flex gap-1.5">
          <span className="size-3.5 rounded-full border-[1.5px] border-ink-black bg-red-halftone" />
          <span className="size-3.5 rounded-full border-[1.5px] border-ink-black bg-yellow-halftone" />
          <span className="size-3.5 rounded-full border-[1.5px] border-ink-black bg-green-halftone" />
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
      <span className="text-green-ink">$</span> {children}
    </p>
  );
}

export function Cursor() {
  return (
    <span aria-hidden className="ml-0.5 inline-block h-4 w-2 animate-blink bg-fg align-middle" />
  );
}
