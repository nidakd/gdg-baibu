import type { Metadata } from "next";
import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";
import { Arc, Asterisk, Braces, Circles, Slashes } from "@/components/brand/brand-shapes";
import { AUTHOR } from "@/components/layout/site-footer";
import { ButtonLink, type Tone } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { Window } from "@/components/ui/window";
import { getSite, getTeams } from "@/lib/content";
import { openGraph } from "@/lib/seo";
import mark from "../../../public/brand/gdg-mark.png";
import logoBlue from "../../../public/brand/gdg-on-campus-aibu-horizontal-blue.png";
import logoDark from "../../../public/brand/gdg-on-campus-aibu-horizontal-dark.png";
import logoLight from "../../../public/brand/gdg-on-campus-aibu-horizontal-light.png";
import logoStacked from "../../../public/brand/gdg-on-campus-aibu-stacked-light.png";
import { CopyHex } from "./_components/copy-hex";

// Marka rehberi: afiş, sunum, gönderi ya da sponsor dosyası hazırlayan herkesin ihtiyacı olan bilgiler.
// Kaynak: resmî GDG On Campus Brand Guide + sitede kullanılan token'lar (src/styles/globals.css).
// Her bölüm tek başına ekran görüntüsü alınabilecek şekilde kurulu (id'ler sabit, kenarlar temiz).

const VERSION = "v1.0 · Kasım 2026";

const description =
  "GDG on Campus AİBÜ'nün logoları, renk kodları, yazı tipleri ve kullanım kuralları: afiş, sunum ve gönderi hazırlayanlar için.";

export const metadata: Metadata = {
  title: "Marka rehberi",
  description,
  openGraph: openGraph({ title: "Marka rehberi", description, path: "/marka" }),
};

const sections = [
  { id: "isim", label: "İsim" },
  { id: "logo", label: "Logo" },
  { id: "renk", label: "Renk" },
  { id: "yazi", label: "Yazı" },
  { id: "gorsel-dil", label: "Görsel dil" },
  { id: "dil", label: "Dil ve ton" },
];

export default function BrandPage() {
  return (
    <>
      <Intro />
      <Naming />
      <Logos />
      <Colours />
      <Typography />
      <VisualLanguage />
      <Voice />
      <Closing />
    </>
  );
}

/* ───────────── giriş ───────────── */

function Intro() {
  return (
    <div
      id="ozet"
      className="mx-auto grid max-w-content items-start gap-10 px-4 pt-12 sm:px-6 md:pt-20 lg:grid-cols-[1fr_24rem]"
    >
      <div className="space-y-6">
        <p className="font-mono text-sm text-fg-subtle">{`// marka rehberi · ${VERSION}`}</p>
        <h1 className="text-[clamp(2.4rem,5vw,4.25rem)] leading-[1.05] font-bold tracking-tight">
          Afişten sunuma,{" "}
          <span className="inline-block -rotate-1 rounded-[0.4em] border-[3px] border-ink-black bg-blue-pastel px-[0.15em] text-ink-black shadow-sticker">
            tek dil.
          </span>
        </h1>
        <p className="max-w-xl text-lg text-fg-muted">
          Afiş, sunum, sosyal medya gönderisi ya da sponsor dosyası hazırlıyorsan ihtiyacın olan her
          şey burada: logolar, renk kodları, yazı tipleri ve birkaç basit kural. Google&apos;ın
          resmî GDG On Campus rehberine dayanır.
        </p>
        <nav aria-label="Rehber bölümleri">
          <ul className="flex flex-wrap gap-2">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 font-mono text-xs text-fg-muted transition hover:border-border-strong hover:text-fg"
                >
                  <span className="text-fg-subtle">{String(i + 1).padStart(2, "0")}</span>
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <Window title="~/marka/ozet.txt" tone="blue" meta="kısaca">
        <dl className="divide-y divide-border text-sm">
          <SummaryRow term="ad">GDG on Campus AİBÜ</SummaryRow>
          <SummaryRow term="renkler">
            <span className="flex flex-wrap gap-1.5">
              {CORE.map((c) => (
                <span key={c.hex} className="inline-flex items-center gap-1.5">
                  <span
                    aria-hidden
                    className="size-3 rounded-full border border-ink-black"
                    style={{ background: c.hex }}
                  />
                  <CopyHex hex={c.hex} />
                </span>
              ))}
            </span>
          </SummaryRow>
          <SummaryRow term="yazı">Google Sans · Google Sans Code</SummaryRow>
          <SummaryRow term="hashtag">
            <span className="font-mono">{getSite().hashtag}</span>
          </SummaryRow>
          <SummaryRow term="logo">
            <a href="#logo" className="underline underline-offset-2">
              PNG dosyaları ↓
            </a>
          </SummaryRow>
        </dl>
      </Window>
    </div>
  );
}

function SummaryRow({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[5.5rem_1fr] items-baseline gap-3 px-4 py-3">
      <dt className="font-mono text-xs text-fg-subtle">{term}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/* ───────────── 01 isim ───────────── */

function Naming() {
  const site = getSite();
  const rows: [string, ReactNode][] = [
    ["Tam ad", "Google Developer Group on Campus Abant İzzet Baysal University"],
    ["Kısa ad", site.name],
    ["En kısa", site.shortName],
    [
      "Hashtag",
      <span key="h" className="font-mono">
        {site.hashtag}
      </span>,
    ],
  ];
  return (
    <Section
      id="isim"
      label="01 — isim"
      title="Adımızı böyle yazıyoruz"
      intro="İlk geçtiği yerde uzun adı, sonrasında kısa adı kullan."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Card className="overflow-hidden">
          <dl className="divide-y divide-border">
            {rows.map(([term, value]) => (
              <div key={term} className="grid gap-1 px-5 py-4 sm:grid-cols-[9rem_1fr] sm:gap-4">
                <dt className="font-mono text-sm text-fg-subtle">{term}</dt>
                <dd className="font-bold">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>
        <Card tone="red" className="space-y-3 p-5">
          <p className="font-mono text-sm text-red-ink">✗ böyle yazma</p>
          <ul className="space-y-2">
            <li>
              <b>Tek başına &quot;GDG&quot;</b>
              <span className="block text-sm text-fg-muted">Şehir GDG&apos;leriyle karışır.</span>
            </li>
            <li>
              <b>&quot;GDSC&quot;</b>
              <span className="block text-sm text-fg-muted">Eski ad, 2024&apos;te değişti.</span>
            </li>
            <li>
              <b>&quot;GDG AİBÜ&quot;</b>
              <span className="block text-sm text-fg-muted">
                &quot;on Campus&quot; adın parçası.
              </span>
            </li>
          </ul>
        </Card>
      </div>
    </Section>
  );
}

/* ───────────── 02 logo ───────────── */

type LogoFile = {
  src: StaticImageData;
  file: string;
  name: string;
  use: string;
  /** Önizleme zemini; temadan bağımsız, logonun gerçekte duracağı zemin */
  bg: string;
  wide?: boolean;
  imgClass: string;
};

const LOGOS: LogoFile[] = [
  {
    src: logoLight,
    file: "gdg-on-campus-aibu-horizontal-light.png",
    name: "Yatay · açık",
    use: "Ana logo. Beyaz ya da açık zeminde.",
    bg: "bg-off-white",
    wide: true,
    imgClass: "h-auto w-[88%]",
  },
  {
    src: logoStacked,
    file: "gdg-on-campus-aibu-stacked-light.png",
    name: "Dikey",
    use: "Kare ya da dar alanlar: profil, rozet.",
    bg: "bg-white",
    imgClass: "h-full w-auto",
  },
  {
    src: logoDark,
    file: "gdg-on-campus-aibu-horizontal-dark.png",
    name: "Yatay · koyu",
    use: "Koyu zeminde.",
    bg: "bg-ink-black",
    imgClass: "h-auto w-[88%]",
  },
  {
    src: logoBlue,
    file: "gdg-on-campus-aibu-horizontal-blue.png",
    name: "Yatay · tek renk",
    use: "Tek renkli baskı: tişört, kupa, mühür.",
    bg: "bg-white",
    imgClass: "h-auto w-[88%]",
  },
  {
    src: mark,
    file: "gdg-mark.png",
    name: "Simge",
    use: "Çok küçük alanlar: ikon, avatar, çıkartma.",
    bg: "bg-white",
    imgClass: "h-16 w-auto",
  },
];

function Logos() {
  return (
    <Section
      id="logo"
      label="02 — logo"
      title="Logoyu çizme, indir"
      intro="Logolar resmî çizimlerdir. Yeniden çizme, renklerini değiştirme; aşağıdan indir."
    >
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {LOGOS.map((logo) => (
          <li key={logo.file} className={logo.wide ? "sm:col-span-2" : ""}>
            <Card className="flex h-full flex-col overflow-hidden">
              <div
                className={`flex h-48 items-center justify-center border-b-2 border-border-strong p-6 ${logo.bg}`}
              >
                <Image
                  src={logo.src}
                  alt=""
                  className={`max-h-full object-contain ${logo.imgClass}`}
                />
              </div>
              <div className="flex flex-1 flex-wrap items-end justify-between gap-3 p-4">
                <div>
                  <p className="font-bold">{logo.name}</p>
                  <p className="text-sm text-fg-muted">{logo.use}</p>
                </div>
                <a
                  href={`/brand/${logo.file}`}
                  download
                  className="inline-flex items-center gap-1.5 rounded-full border-2 border-border-strong bg-surface px-3 py-1 font-mono text-xs shadow-sticker-sm transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-sticker"
                >
                  PNG <span aria-hidden>↓</span>
                  <span className="sr-only"> indir: {logo.name}</span>
                </a>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <RuleList
          tone="green"
          title="✓ yap"
          items={[
            "Açık zeminde açık, koyu zeminde koyu sürümü kullan.",
            "Logonun çevresinde nefes alacak kadar boşluk bırak.",
            "Yer darsa yatay yerine dikey logoyu seç.",
            <>
              <Braces className="font-mono text-sm">On Campus</Braces> etiketi logo değil, süs
              olarak serbestçe kullanılabilir.
            </>,
          ]}
        />
        <RuleList
          tone="red"
          title="✗ yapma"
          items={[
            "Esnetme, sıkıştırma, döndürme.",
            "Renklerini değiştirme, gölge ya da efekt ekleme.",
            "Renkli zeminin ya da kalabalık bir fotoğrafın üstüne koyma.",
            "Logoyu yazıyla taklit etme.",
          ]}
        />
      </div>
    </Section>
  );
}

function RuleList({ tone, title, items }: { tone: Tone; title: string; items: ReactNode[] }) {
  const ink = tone === "green" ? "text-green-ink" : "text-red-ink";
  return (
    <Card tone={tone} className="p-5">
      <p className={`mb-3 font-mono text-sm ${ink}`}>{title}</p>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span aria-hidden className="text-fg-subtle">
              –
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ───────────── 03 renk ───────────── */

const CORE = [
  { name: "Mavi", hex: "#4285F4" },
  { name: "Yeşil", hex: "#34A853" },
  { name: "Sarı", hex: "#F9AB00" },
  { name: "Kırmızı", hex: "#EA4335" },
];

const FAMILIES = [
  { name: "Mavi", core: "#4285F4", halftone: "#57CAFF", pastel: "#C3ECF6", ink: "#1967D2" },
  { name: "Yeşil", core: "#34A853", halftone: "#5CDB6D", pastel: "#CCF6C5", ink: "#137333" },
  { name: "Sarı", core: "#F9AB00", halftone: "#FFD427", pastel: "#FFE7A5", ink: "#9A5000" },
  { name: "Kırmızı", core: "#EA4335", halftone: "#FF7DAF", pastel: "#F8D8D8", ink: "#C5221F" },
];

// Ekip renkleri; eflatun ve gümüş rehberde yok, altı grubu ayırmak için eklendi
const TEAM_HEX: Record<Tone, string> = {
  blue: "#4285F4",
  green: "#34A853",
  yellow: "#F9AB00",
  red: "#EA4335",
  lilac: "#A58CF5",
  silver: "#9AA0A6",
};

function Colours() {
  return (
    <Section
      id="renk"
      label="03 — renk"
      title="Dört renk, her birinin üç tonu"
      intro="Çekirdek renk dolgu ve büyük başlık için, halftone vurgu için, pastel geniş yüzeyler için. Bir koda tıklayınca kopyalanır."
    >
      <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {FAMILIES.map((f) => (
          <li key={f.name}>
            <Card className="overflow-hidden">
              <Swatch hex={f.core} label={f.name} size="lg" />
              <Swatch hex={f.halftone} label="halftone" />
              <Swatch hex={f.pastel} label="pastel" />
              <div className="flex flex-wrap items-center justify-between gap-x-2 px-3 py-2.5 text-sm sm:px-4">
                <span className="font-mono text-xs text-fg-subtle">yazı rengi</span>
                <span className="flex items-center gap-1.5">
                  <span aria-hidden className="size-3 rounded-full" style={{ background: f.ink }} />
                  <CopyHex hex={f.ink} />
                </span>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      <ul className="mt-5 grid gap-5 sm:grid-cols-2">
        <li>
          <Card className="flex items-end justify-between bg-off-white! p-5 text-ink-black">
            <span className="text-lg font-bold">Off White</span>
            <CopyHex hex="#F0F0F0" />
          </Card>
        </li>
        <li>
          <Card className="flex items-end justify-between bg-ink-black! p-5 text-off-white dark:border-border">
            <span className="text-lg font-bold">Black 02</span>
            <CopyHex hex="#1E1E1E" />
          </Card>
        </li>
      </ul>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        <ColourRule
          title="Renkli zeminde yazı koyu"
          sample={
            <span className="rounded-full border-2 border-ink-black bg-blue px-4 py-1.5 text-sm font-medium text-ink-black">
              Aramıza katıl
            </span>
          }
        >
          Yazıyı #1E1E1E yap. Beyaz yazı bu dört rengin hiçbirinde rahat okunmaz.
        </ColourRule>
        <ColourRule
          title="Küçük yazıda koyu ton"
          sample={
            <span className="font-mono text-sm">
              <span className="text-yellow line-through decoration-fg-subtle">son etkinlik</span>
              <span className="mx-2 text-fg-subtle">→</span>
              <span className="text-yellow-ink">son etkinlik</span>
            </span>
          }
        >
          Çekirdek renkler küçük yazıda okunmaz. Açık zeminde renkli küçük yazı için kartın en
          altındaki yazı rengini kullan.
        </ColourRule>
        <ColourRule
          title="Bir alanda tek baskın renk"
          sample={
            <span className="flex gap-1.5">
              <span className="h-6 w-14 rounded-md border-2 border-ink-black bg-blue" />
              <span className="h-6 w-10 rounded-md border-2 border-ink-black bg-blue-pastel" />
              <span className="h-6 w-10 rounded-md border-2 border-ink-black bg-off-white" />
            </span>
          }
        >
          Bir renk öne çıksın, gerisi pastel ya da nötr kalsın. Geniş yüzeylerde sarı yerine pastel
          kullan.
        </ColourRule>
      </div>

      <h3 className="mt-14 text-xl font-bold">Ekip renkleri</h3>
      <p className="mt-1 max-w-2xl text-fg-muted">
        Ekipleri ayırmak için. Eflatun ve gümüş resmî rehberde yok, altı grubu ayırabilmek için
        eklendi.
      </p>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {getTeams().map((team) => (
          <li key={team.id}>
            <Card tone={team.tone} className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="size-6 shrink-0 rounded-full border-2 border-ink-black"
                  style={{ background: TEAM_HEX[team.tone] }}
                />
                <span className="font-medium">{team.name}</span>
              </span>
              <CopyHex hex={TEAM_HEX[team.tone]} className="text-fg-muted" />
            </Card>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function Swatch({ hex, label, size }: { hex: string; label: string; size?: "lg" }) {
  return (
    <div
      className={`flex flex-wrap items-end justify-between gap-x-2 border-b-2 border-border-strong px-3 text-ink-black sm:px-4 ${size === "lg" ? "h-24 pb-3 sm:h-28" : "h-12 pb-2"}`}
      style={{ background: hex }}
    >
      <span className={size === "lg" ? "text-lg font-bold" : "font-mono text-xs"}>{label}</span>
      <CopyHex hex={hex} />
    </div>
  );
}

function ColourRule({
  title,
  sample,
  children,
}: {
  title: string;
  sample: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-card border border-border bg-surface p-5">
      <div className="flex min-h-10 items-center">{sample}</div>
      <p className="font-bold">{title}</p>
      <p className="text-sm text-fg-muted">{children}</p>
    </div>
  );
}

/* ───────────── 04 yazı ───────────── */

function Typography() {
  return (
    <Section
      id="yazi"
      label="04 — yazı"
      title="İki yazı tipi, ikisi de ücretsiz"
      intro="İkisi de Google Fonts'ta. Başka yazı tipi ekleme; vurgu için kalınlığı değiştir."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <FontCard
          name="Google Sans"
          href="https://fonts.google.com/specimen/Google+Sans"
          sample={<span className="font-sans">Aa Ğğ</span>}
          use="Başlıklar ve metin. Başlıklar kalın ve sıkı, metin normal ağırlıkta."
          weights="Regular 400 · Medium 500 · Bold 700"
        />
        <FontCard
          name="Google Sans Code"
          href="https://fonts.google.com/specimen/Google+Sans+Code"
          sample={<span className="font-mono">{"Aa {}"}</span>}
          use="Etiketler, tarihler, kısa notlar. Uzun paragrafta kullanma."
          weights="Regular 400 · Medium 500 · Bold 700"
          mono
        />
      </div>

      <Card className="mt-5 divide-y divide-border">
        <TypeRow spec="Başlık · Bold">
          <span className="text-3xl font-bold tracking-tight sm:text-4xl">
            Birlikte üretiyoruz.
          </span>
        </TypeRow>
        <TypeRow spec="Alt başlık · Bold">
          <span className="text-xl font-bold">Python 101 atölyesi</span>
        </TypeRow>
        <TypeRow spec="Metin · Regular">
          <span className="text-fg-muted">
            Atölyelerde birlikte kod yazıyor, kariyer buluşmalarında sektörden insanlarla
            tanışıyoruz.
          </span>
        </TypeRow>
        <TypeRow spec="Etiket · Code">
          <span className="font-mono text-sm text-fg-subtle">
            {"// 02 — etkinlikler · 5 Kasım 2026"}
          </span>
        </TypeRow>
      </Card>
    </Section>
  );
}

function FontCard({
  name,
  href,
  sample,
  use,
  weights,
  mono,
}: {
  name: string;
  href: string;
  sample: ReactNode;
  use: string;
  weights: string;
  mono?: boolean;
}) {
  return (
    <Card className="flex flex-col gap-4 p-6">
      <div className="flex items-start justify-between gap-3">
        <p className={`font-bold ${mono ? "font-mono" : ""}`}>{name}</p>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 font-mono text-xs text-blue-ink underline underline-offset-2"
        >
          Google Fonts ↗<span className="sr-only"> (yeni sekmede açılır)</span>
        </a>
      </div>
      <p aria-hidden className="text-7xl leading-none font-bold tracking-tight sm:text-8xl">
        {sample}
      </p>
      <p className="text-fg-muted">{use}</p>
      <p className="mt-auto font-mono text-xs text-fg-subtle">{weights}</p>
    </Card>
  );
}

function TypeRow({ spec, children }: { spec: string; children: ReactNode }) {
  return (
    <div className="grid items-baseline gap-2 px-5 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
      <span className="font-mono text-xs text-fg-subtle">{spec}</span>
      {children}
    </div>
  );
}

/* ───────────── 05 görsel dil ───────────── */

function VisualLanguage() {
  return (
    <Section
      id="gorsel-dil"
      label="05 — görsel dil"
      title="Çıkartma gibi, terminal gibi"
      intro="Resmî rehberin çizgi şekilleri, geliştirici araçlarının diliyle buluşuyor. Bir tasarımda hepsini değil, iki üçünü kullan."
    >
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <VisualTile
          title="Çerçeve ve sert gölge"
          text="2–3 px koyu çerçeve, bulanık olmayan düz gölge. Kartlar, butonlar, fotoğraflar."
        >
          <span className="block h-16 w-28 rounded-card border-2 border-border-strong bg-surface shadow-sticker-lg" />
        </VisualTile>
        <VisualTile
          title="Pencere"
          text="Pastel üst çubuk ve üç daire. Liste, duyuru ya da ekip kartı için."
        >
          <Window title="~/etkinlikler" tone="green" className="w-full max-w-56">
            <div className="h-10" />
          </Window>
        </VisualTile>
        <VisualTile title="Yorum etiketi" text="Başlığın üstünde kısa, kod yorumu gibi bir etiket.">
          <span className="font-mono text-fg-subtle">{"// 01 — ne yapıyoruz"}</span>
        </VisualTile>
        <VisualTile
          title="Çıkartma kelime"
          text="Büyük başlıkta en fazla iki kelime; hafif eğik, pastel zemin, koyu yazı."
        >
          <span className="inline-block rotate-1 rounded-[0.4em] border-[3px] border-ink-black bg-green-pastel px-2 text-3xl font-bold text-ink-black shadow-sticker">
            üretiyoruz.
          </span>
        </VisualTile>
        <VisualTile
          title="Çizgi şekilleri"
          text="İnce konturlu süsler. Bilgi taşımaz, logonun yerine geçmez."
        >
          <span className="flex items-center gap-4">
            <Slashes className="h-12" />
            <Asterisk className="h-9" />
            <Arc className="h-12" />
            <Circles className="h-6" />
          </span>
        </VisualTile>
        <VisualTile
          title="Noktalı zemin"
          text="Sayfanın kâğıdı: açık gri üstünde 22 px aralıklı noktalar. Bölümler çizgiyle değil boşlukla ayrılır."
        >
          <span
            className="block h-16 w-full rounded-xl border border-border"
            style={{
              backgroundImage: "radial-gradient(var(--dot) 1.4px, transparent 1.8px)",
              backgroundSize: "22px 22px",
            }}
          />
        </VisualTile>
      </ul>
    </Section>
  );
}

function VisualTile({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children: ReactNode;
}) {
  return (
    <li className="flex flex-col rounded-card border border-border bg-surface p-5">
      <div className="grid min-h-32 place-items-center">{children}</div>
      <p className="mt-4 font-bold">{title}</p>
      <p className="text-sm text-fg-muted">{text}</p>
    </li>
  );
}

/* ───────────── 06 dil ───────────── */

function Voice() {
  return (
    <Section
      id="dil"
      label="06 — dil ve ton"
      title="Deneyim şart değil, merak yeter"
      intro="Bir arkadaşına anlatır gibi yaz: Türkçe, “sen” diliyle, kısa cümlelerle."
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Card className="p-6">
          <ul className="space-y-4">
            {[
              ["Kısa yaz.", "Bir cümle bir fikir taşısın."],
              ["Terimi açıkla.", "Teknik bir kelime geçiyorsa yanında ne olduğunu söyle."],
              ["Az ünlem, az emoji.", "Heyecanı içerik versin."],
              [
                "Adları olduğu gibi bırak.",
                "Etkinlik ve ekip adlarını GDG Community'deki gibi yaz.",
              ],
            ].map(([rule, detail]) => (
              <li key={rule}>
                <p className="font-bold">{rule}</p>
                <p className="text-fg-muted">{detail}</p>
              </li>
            ))}
          </ul>
        </Card>
        <div className="grid gap-5">
          <Card tone="green" className="p-6">
            <p className="font-mono text-sm text-green-ink">✓ böyle</p>
            <p className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
              Sponsorluk, iş birliği, bir fikir ya da sadece merhaba: kutumuz açık.
            </p>
          </Card>
          <Card tone="red" className="p-6">
            <p className="font-mono text-sm text-red-ink">✗ böyle değil</p>
            <p className="mt-2 text-xl font-medium tracking-tight text-fg-muted sm:text-2xl">
              Topluluğumuzun sinerjisini maksimize eden paydaş iletişim kanalı.
            </p>
          </Card>
        </div>
      </div>
    </Section>
  );
}

/* ───────────── kapanış ───────────── */

function Closing() {
  const site = getSite();
  return (
    <div className="mx-auto max-w-content px-4 pb-4 sm:px-6">
      <Card tone="blue" className="flex flex-wrap items-center justify-between gap-6 p-6 sm:p-8">
        <div className="max-w-xl space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Emin olmadığın bir şey mi var?</h2>
          <p className="text-fg-muted">
            Bir tasarımı paylaşmadan önce göz atmamızı istersen ya da burada olmayan bir dosyaya
            ihtiyacın varsa yaz.
          </p>
        </div>
        <ButtonLink href={`mailto:${site.email}`} tone="plain">
          {site.email}
        </ButtonLink>
      </Card>
      <div className="mt-6 flex flex-wrap justify-between gap-x-8 gap-y-2 font-mono text-xs text-fg-subtle">
        <p>
          {VERSION} · Resmî GDG On Campus Brand Guide&apos;a dayanır; GDG adı ve logosu
          Google&apos;ın kurallarına tabidir.
        </p>
        <p>
          rehber:{" "}
          <a href={AUTHOR.url} target="_blank" rel="author noreferrer" className="hover:underline">
            {AUTHOR.name} ↗
          </a>
        </p>
      </div>
    </div>
  );
}
