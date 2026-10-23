import { Logo } from "@/components/brand/logo";

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-4 sm:px-6">
        <Logo />
        <span className="hidden font-mono text-xs text-fg-subtle sm:inline">#GDGOnCampus</span>
      </div>
    </header>
  );
}
