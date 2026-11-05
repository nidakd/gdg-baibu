import Link from "next/link";
import { DinoRunner } from "@/components/fun/dino-runner";
import { MarqueeRibbon } from "@/components/fun/marquee-ribbon";
import { Reveal } from "@/components/motion/reveal";
import { FocusAreas } from "@/components/sections/focus-areas";
import { Avatar } from "@/components/team/avatar";
import { ButtonLink } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { ContactSection } from "@/components/sections/contact-section";
import { WaveBand } from "@/components/ui/wave-band";
import { getMembers, getSite } from "@/lib/content";
import { getEventTimeline } from "@/lib/events";
import { Hero } from "./_components/hero";
import { LatestEvents } from "./_components/latest-events";

export default async function Home() {
  const site = getSite();
  const members = getMembers();
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
        label="02 — ne yapıyoruz"
        title="Altı alanda üretiyoruz"
        action={
          <ButtonLink href="/hakkimizda" tone="plain">
            Hakkımızda
          </ButtonLink>
        }
      >
        <Reveal>
          <FocusAreas />
        </Reveal>
      </Section>

      <DinoRunner />

      <Section
        label="03 — contributors"
        title="Bu dönemin core team'i"
        intro="Etkinlikleri planlayan, afişleri tasarlayan, atölyeleri hazırlayan ekip."
        action={
          <ButtonLink href="/ekip" tone="green">
            Tüm ekip
          </ButtonLink>
        }
      >
        <ul className="flex flex-wrap gap-3">
          {members.map((member, i) => (
            <li key={member.slug}>
              <Reveal delay={i * 40}>
                <Link
                  href={`/ekip/${member.slug}`}
                  title={`${member.name} · ${member.role}`}
                  className="block rounded-full transition duration-300 hover:z-10 hover:-translate-y-1 hover:scale-125 hover:rotate-3 focus-visible:scale-125"
                >
                  <Avatar name={member.name} photoUrl={member.photoUrl} size={64} />
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>

      <div className="mx-auto max-w-content px-4 pb-24 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-card border-[3px] border-border-strong bg-green-soft p-8 text-fg shadow-sticker-lg md:p-12">
            <p className="font-mono text-sm">{"// 04 — deploy yourself"}</p>
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

      <ContactSection label="05 — iletişim" className="pt-0" />
    </>
  );
}
