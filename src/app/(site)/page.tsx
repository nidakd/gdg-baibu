import { DinoRunner } from "@/components/fun/dino-runner";
import { MarqueeRibbon } from "@/components/fun/marquee-ribbon";
import { Reveal } from "@/components/motion/reveal";
import { FocusBigPills } from "@/components/home/focus-big-pills";
import { JoinPath } from "@/components/home/join-path";
import { TeamSpotlight } from "@/components/home/team-spotlight";
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
  const members = await getMembers();
  const photos = await getPhotos();
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
          <FocusBigPills events={past} />
        </Reveal>
      </Section>

      <DinoRunner />

      {/* Kişiler footer'daki isim şeridinde de var; burada her seferinde biri öne çıkar */}
      <Section
        label="04 — contributors"
        title="Bu dönemin core team'i"
        intro="Etkinlikleri planlayan, afişleri tasarlayan, atölyeleri hazırlayan ekip. Birine tıkla, tanış."
        action={
          <ButtonLink href="/ekip" tone="green">
            Tüm ekip
          </ButtonLink>
        }
      >
        <Reveal>
          <TeamSpotlight
            members={members.map((m) => ({
              slug: m.slug,
              name: m.name,
              role: m.role,
              team: m.team.name,
              photoUrl: m.photoUrl,
              intro: m.bio,
            }))}
          />
        </Reveal>
      </Section>

      {/* Son etkinlikler'deki mavi dalga bandının eşi: sayfa iki bantla bir bütün gibi okunur */}
      <JoinPath whatsapp={site.links.whatsapp} form={site.links.coreTeamForm} />

      <ContactSection label="06 — iletişim" />
    </>
  );
}
