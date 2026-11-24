import { ButtonLink } from "@/components/ui/button";
import { Prompt, Terminal } from "@/components/ui/terminal";

/** 404 içeriği: kök 404 (sitenin çerçevesiyle) ve site içi notFound() kullanır. */
export function NotFoundContent() {
  return (
    <div className="mx-auto grid max-w-content gap-10 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-2 lg:items-center">
      <div className="space-y-5">
        <p className="font-mono text-sm text-fg-subtle">{"// 404"}</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Bu sayfa bulunamadı</h1>
        <p className="text-lg text-fg-muted">
          Adres yanlış yazılmış ya da sayfa taşınmış olabilir.
        </p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/">Ana sayfa</ButtonLink>
          <ButtonLink href="/ekip" tone="plain">
            Ekip
          </ButtonLink>
        </div>
      </div>
      <Terminal>
        <Prompt>cd sayfa</Prompt>
        <p>
          <span className="text-red-ink">cd:</span> no such file or directory
        </p>
      </Terminal>
    </div>
  );
}
