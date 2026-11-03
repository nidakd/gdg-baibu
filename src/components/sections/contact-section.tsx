import { Asterisk } from "@/components/brand/brand-shapes";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { getSite } from "@/lib/content";
import { ContactForm } from "./contact-form";

/** "Bizimle iletişime geç" bölümü: form, sosyal bağlantılar ve yanında eğlenceli not. Ana sayfa ve hakkımızda kullanır. */
export function ContactSection({ label, className }: { label: string; className?: string }) {
  const site = getSite();
  return (
    <Section
      label={label}
      title="Bizimle iletişime geç"
      intro="Sponsorluk, iş birliği, bir fikir ya da sadece merhaba: kutumuz açık."
      className={className}
    >
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,1.2fr)]">
        <div className="space-y-5">
          <ContactForm to={site.email} />
          <p className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-sm text-fg-subtle">
            {"// ya da bizi takip et:"}
            {[
              { label: "Instagram", href: site.links.instagram },
              { label: "LinkedIn", href: site.links.linkedin },
              { label: "WhatsApp", href: site.links.whatsapp },
            ].map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="text-fg hover:underline"
              >
                {l.label} <span aria-hidden>↗</span>
              </a>
            ))}
          </p>
        </div>
        <FaqNote />
      </div>
    </Section>
  );
}

/** İletişim formunun yanındaki eğlenceli not: sık sorulanlar, JSON gibi. */
function FaqNote() {
  const rows: [string, string][] = [
    ["cevap", "birkaç gün"],
    ["dil", "tr · en"],
    ["sever", "yeni fikir"],
    ["spam", "yok ☕"],
  ];
  return (
    <div className="relative hidden lg:block">
      <Asterisk aria-hidden className="absolute -top-6 -right-2 size-12 text-fg" />
      <Card tone="yellow" className="rotate-2 p-5 font-mono text-sm leading-relaxed">
        <p className="text-syntax-comment">{"// sss.json"}</p>
        <p>{"{"}</p>
        {rows.map(([k, v], i) => (
          <p key={k} className="pl-4">
            <span className="text-syntax-keyword">&quot;{k}&quot;</span>:{" "}
            <span className="text-syntax-string">&quot;{v}&quot;</span>
            {i < rows.length - 1 ? "," : ""}
          </p>
        ))}
        <p>{"}"}</p>
      </Card>
    </div>
  );
}
