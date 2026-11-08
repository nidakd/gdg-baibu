// Sitenin genel paylaşım görseli (WhatsApp, LinkedIn, X önizlemesi). Alt sayfalar da bunu kullanır;
// etkinlik sayfaları kendi afişini verir. Derleme sırasında bir kez üretilir.

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getMembers, getSite } from "@/lib/content";
import { getEventTimeline } from "@/lib/events";

export const alt = "GDG on Campus AİBÜ: Birlikte öğreniyor, birlikte üretiyoruz.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#1e1e1e";

/**
 * Yazı tipleri _og/ klasöründe: Google Sans ve Google Sans Code (OFL), Latin + Türkçe harflerle sınırlı
 * küçük kopyalar. Görseli üreten kütüphane Google Fonts dosyalarındaki bazı GSUB tablolarını okuyamadığı
 * için bu tablolar çıkarıldı (pyftsubset --drop-tables+=GSUB); derlemede ağa gerek kalmaz.
 */
const font = (file: string, name: string, weight: 500 | 700) =>
  readFile(join(process.cwd(), "src/app/_og", file)).then((data) => ({ name, data, weight }));

function Sticker({ bg, rotate, children }: { bg: string; rotate: number; children: string }) {
  return (
    <span
      style={{
        display: "flex",
        background: bg,
        border: `4px solid ${INK}`,
        borderRadius: 18,
        padding: "0 18px 6px",
        margin: "0 0 0 18px",
        boxShadow: `6px 6px 0 ${INK}`,
        transform: `rotate(${rotate}deg)`,
      }}
    >
      {children}
    </span>
  );
}

function Pill({ color, width, top, left, rotate }: { color: string; width: number; top: number; left: number; rotate: number }) {
  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        width,
        height: 84,
        borderRadius: 999,
        background: color,
        border: `5px solid ${INK}`,
        boxShadow: `7px 7px 0 ${INK}`,
        transform: `rotate(${rotate}deg)`,
      }}
    />
  );
}

export default async function OpengraphImage() {
  const site = getSite();
  const host = new URL(site.url).host;
  const title = ["Birlikte", "öğreniyor,", "birlikte", "üretiyoruz."];
  // Sayılar içerikten gelir, her yayında güncellenir; etkinlik sayısı ana sayfadaki gibi geçmiş etkinlikler
  const { past } = await getEventTimeline();
  const label = `${site.stats.communityMembers} üye · ${past.length} etkinlik · ${getMembers().length} kişilik core team`;

  const [logo, sans, mono] = await Promise.all([
    readFile(join(process.cwd(), "public/brand/gdg-on-campus-aibu-horizontal-light.png")),
    font("sans-700.ttf", "Google Sans", 700),
    font("code-500.ttf", "Google Sans Code", 500),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#f0f0f0",
          backgroundImage: "radial-gradient(#cdcdcd 1.6px, transparent 2px)",
          backgroundSize: "28px 28px",
          color: INK,
          fontFamily: "Google Sans",
          overflow: "hidden",
        }}
      >
        {/* Sağdaki hap şekilleri: giriş bölümündekilerin büyük hali */}
        <Pill color="#ea4335" width={250} top={60} left={860} rotate={-35} />
        <Pill color="#34a853" width={300} top={-10} left={1000} rotate={35} />
        <Pill color="#4285f4" width={260} top={450} left={930} rotate={35} />
        <Pill color="#f9ab00" width={220} top={330} left={1030} rotate={-35} />

        <div style={{ display: "flex", flexDirection: "column", padding: "64px 72px", gap: 34 }}>
          <img
            src={`data:image/png;base64,${logo.toString("base64")}`}
            width={560}
            height={Math.round((560 * 194) / 1684)}
            alt=""
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 92,
              fontWeight: 700,
              letterSpacing: -3,
              lineHeight: 1.08,
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              {title[0]}
              <Sticker bg="#c3ecf6" rotate={-2}>
                {title[1]}
              </Sticker>
            </div>
            <div style={{ display: "flex", alignItems: "center", marginTop: 14 }}>
              {title[2]}
              <Sticker bg="#ccf6c5" rotate={1}>
                {title[3]}
              </Sticker>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontFamily: "Google Sans Code",
              fontSize: 26,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "#ffffff",
                border: `3px solid ${INK}`,
                borderRadius: 999,
                padding: "8px 22px",
                boxShadow: `4px 4px 0 ${INK}`,
              }}
            >
              <span style={{ width: 14, height: 14, borderRadius: 999, background: "#34a853" }} />
              {label}
            </div>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 72,
            bottom: 44,
            display: "flex",
            fontFamily: "Google Sans Code",
            fontSize: 24,
            color: "#5f5f5f",
          }}
        >
          {host}
        </div>
      </div>
    ),
    { ...size, fonts: [sans, mono] },
  );
}
