import Link from "next/link";
import { DinoRunner } from "@/components/fun/dino-runner";
import { MarqueeRibbon } from "@/components/fun/marquee-ribbon";
import { Reveal } from "@/components/motion/reveal";
import { FocusAreaPills } from "@/components/sections/focus-area-pills";
import { Avatar } from "@/components/team/avatar";
import { ButtonLink } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { ContactSection } from "@/components/sections/contact-section";
import { WaveBand } from "@/components/ui/wave-band";
import { PhotoStrip } from "@/components/sections/photo-strip";
import { getMembers, getPhotos, getSite } from "@/lib/content";
import { getEventTimeline } from "@/lib/events";
import { Hero } from "./_components/hero";
import { LatestEvents } from "./_components/latest-events";

export default async function Home() {
  const site = getSite();
  const members = getMembers();
  const photos = getPhotos();
  // Yaklaşan etkinlik ayrı kartta; listede sadece geçmişler
  const { upcoming, past } = await getEventTimeline();
  const next = upcoming[0];

  return (
    <>
      <Hero />
      <MarqueeRibbon
        className="-mt-4"
        colorClass="bg-surface text-fg"
        edgeClass="border-blue shadow-[0_4px_0_0_var(--brand-blue-halftone)]"
      />

      {/* Rakamlar terminalde zaten var; kartlar sadece hakkımızda sayfasında */}
      <div className="h-16" />

      <WaveBand tone="blue">
        <Section
          label="01 — son sürümler"
          title="Son etkinlikler"
          className="py-8 md:py-10"
          action={
            <ButtonLink href="/etkinlikler" tone="plain">
              Tüm etkinlikler
            </ButtonLink>
          }
        >
          <LatestEvents next={next} past={past} />
        </Section>
      </WaveBand>

      <Section
        label="02 — kareler"
        title="Etkinliklerden kareler"
        intro="Atölyeler, kahve sohbetleri, sahne anları. Bir kareye tıkla, o etkinliğe git."
        action={
          <ButtonLink href="/etkinlikler" tone="plain">
            Tüm etkinlikler
          </ButtonLink>
        }
      >
        <PhotoStrip photos={photos} />
      </Section>

      <Section
        label="03 — ne yapıyoruz"
        title="Altı alanda üretiyoruz"
        intro="Birine tıkla, o alandaki etkinlikleri gör."
        action={
          <ButtonLink href="/hakkimizda" tone="plain">
            Hakkımızda
          </ButtonLink>
        }
      >
        <Reveal>
          <FocusAreaPills />
        </Reveal>
      </Section>

      <DinoRunner />

      {/* Kişiler footer'daki isim şeridinde de var; burada tek satırlık bir davet */}
      <Section label="04 — contributors" title="Bu dönemin core team'i">
        <Reveal>
          <div className="flex flex-wrap items-center justify-between gap-5 rounded-card border-2 border-border-strong bg-surface p-5 shadow-sticker sm:p-6">
            <Link href="/ekip" className="group flex items-center gap-4">
              <span className="flex -space-x-3">
                {members.slice(0, 7).map((member) => (
                  <Avatar
                    key={member.slug}
                    name={member.name}
                    photoUrl={member.photoUrl}
                    size={48}
                  />
                ))}
              </span>
              <span>
                <span className="block font-bold group-hover:underline">
                  {members.length} kişilik core team
                </span>
                <span className="text-sm text-fg-muted">
                  Etkinlikleri planlayan, afişleri tasarlayan, atölyeleri hazırlayan ekip.
                </span>
              </span>
            </Link>
            <ButtonLink href="/ekip" tone="green">
              Ekibi tanı
            </ButtonLink>
          </div>
        </Reveal>
      </Section>

      <div className="mx-auto max-w-content px-4 pb-24 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-card border-[3px] border-border-strong bg-green-soft p-8 text-fg shadow-sticker-lg md:p-12">
            <p className="font-mono text-sm">{"// 05 — deploy yourself"}</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-balance sm:text-5xl">
              Deneyim şart değil. Merak yeter.
            </h2>
            <ol className="mt-8 grid gap-4 font-mono text-sm md:grid-cols-3">
              {[
                ["git clone", "WhatsApp grubuna katıl, duyuruları ilk sen gör."],
                ["npm install", "Bir etkinliğe gel, ekiple tanış."],
                ["deploy", "Core team başvurusunu doldur, bir ekibe katıl."],
              ].map(([cmd, text], i) => (
                <li
                  key={cmd}
                  className="rounded-xl border-2 border-border-strong bg-surface p-4 transition odd:-rotate-1 even:rotate-1 hover:rotate-0"
                >
                  <span className="font-bold">
                    {i + 1}. $ {cmd}
                  </span>
                  <p className="mt-2 font-sans text-base">{text}</p>
                </li>
              ))}
            </ol>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={site.links.whatsapp} tone="green">
                WhatsApp grubu
              </ButtonLink>
              <ButtonLink href={site.links.coreTeamForm} tone="blue">
                Core team başvurusu
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </div>

      <ContactSection label="06 — iletişim" className="pt-0" />
    </>
  );
}
