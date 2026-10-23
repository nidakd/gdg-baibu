import { getSite } from "@/lib/content";

export function SiteFooter() {
  const site = getSite();
  const links = [
    { label: "Instagram", href: site.links.instagram },
    { label: "LinkedIn", href: site.links.linkedin },
    { label: "GDG Community", href: site.links.gdgCommunity },
    { label: "WhatsApp", href: site.links.whatsapp },
  ];

  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto grid max-w-content gap-6 px-4 py-10 text-sm sm:px-6 md:grid-cols-[1fr_auto]">
        <div className="space-y-2">
          <p className="font-medium">{site.name}</p>
          <p className="max-w-prose text-fg-muted">{site.disclaimer}</p>
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-fg-muted md:justify-end">
          {links.map((link) => (
            <li key={link.label}>
              <a href={link.href} target="_blank" rel="noreferrer" className="hover:text-fg">
                {link.label} ↗
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
