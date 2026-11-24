import { withBotId } from "botid/next/config";
import type { NextConfig } from "next";

// Güvenlik başlıkları. CSP sadece kendi adresimize ve Cloudinary görsellerine izin verir;
// Next.js satır içi betik kullandığı için script-src'de 'unsafe-inline' gerekiyor
// (nonce sayfaları dinamik yapardı). Geliştirmede hızlı yenileme ve Analytics'in hata ayıklama
// betiği, önizleme dağıtımlarında da Vercel araç çubuğu (vercel.live) için ek izin verilir.
const dev = process.env.NODE_ENV === "development";
// Panelden yüklenen ekip fotoğrafları Supabase Storage'dan gelir
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
  : null;
const preview = process.env.VERCEL_ENV === "preview";
const extra = (...sources: (string | false | null)[]) =>
  sources
    .filter(Boolean)
    .map((s) => ` ${s}`)
    .join("");
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${extra(dev && "'unsafe-eval' https://va.vercel-scripts.com", preview && "https://vercel.live")}`,
  `style-src 'self' 'unsafe-inline'${extra(preview && "https://vercel.live")}`,
  `img-src 'self' data: blob: https://res.cloudinary.com${extra(supabaseHost && `https://${supabaseHost}`, preview && "https://vercel.live https://vercel.com")}`,
  `font-src 'self'${extra(preview && "https://vercel.live https://assets.vercel.com")}`,
  `connect-src 'self'${extra(dev && "ws:", preview && "https://vercel.live wss://ws-us3.pusher.com")}`,
  // BotID kendi yolunu (aynı adres) gizli bir çerçevede açabiliyor
  `frame-src 'self'${extra(preview && "https://vercel.live")}`,
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const BOTID_PATH = "149e9513-01fa-4fb0-aad4-566afd725d1b";

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  agentRules: false,
  poweredByHeader: false,
  async headers() {
    // BotID'nin yolu hariç: withBotId oraya kendi (aynı adresten çerçeveye izin veren) başlıklarını koyar
    return [{ source: `/((?!${BOTID_PATH}/).*)`, headers: securityHeaders }];
  },
  images: {
    // GDG Community (Bevy) etkinlik ve profil görselleri
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/startup-grind/**" },
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/ekip/**",
            },
          ]
        : []),
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

// withBotId: BotID betiğini ve kontrol isteklerini kendi adresimiz üzerinden Vercel'e yönlendirir
export default withBotId(nextConfig);
