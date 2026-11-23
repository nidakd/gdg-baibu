import type { NextConfig } from "next";

// Güvenlik başlıkları. CSP sadece kendi adresimize ve Cloudinary görsellerine izin verir;
// Next.js satır içi betik kullandığı için script-src'de 'unsafe-inline' gerekiyor
// (nonce sayfaları dinamik yapardı). Geliştirmede hızlı yenileme ve Analytics'in hata ayıklama
// betiği, önizleme dağıtımlarında da Vercel araç çubuğu (vercel.live) için ek izin verilir.
const dev = process.env.NODE_ENV === "development";
const preview = process.env.VERCEL_ENV === "preview";
const extra = (...sources: (string | false)[]) => sources.filter(Boolean).map((s) => ` ${s}`).join("");
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${extra(dev && "'unsafe-eval' https://va.vercel-scripts.com", preview && "https://vercel.live")}`,
  `style-src 'self' 'unsafe-inline'${extra(preview && "https://vercel.live")}`,
  `img-src 'self' data: blob: https://res.cloudinary.com${extra(preview && "https://vercel.live https://vercel.com")}`,
  `font-src 'self'${extra(preview && "https://vercel.live https://assets.vercel.com")}`,
  `connect-src 'self'${extra(dev && "ws:", preview && "https://vercel.live wss://ws-us3.pusher.com")}`,
  `frame-src ${preview ? "https://vercel.live" : "'none'"}`,
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  agentRules: false,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    // GDG Community (Bevy) etkinlik ve profil görselleri
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/startup-grind/**" },
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

export default nextConfig;
