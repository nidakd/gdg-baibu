import { Brand } from "./brand";

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-4 sm:px-6">
        <Brand />
        <span className="font-mono text-xs text-fg-subtle">main · v0.1</span>
      </div>
    </header>
  );
}
