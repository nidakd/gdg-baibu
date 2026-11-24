import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Panel girişi",
  robots: { index: false, follow: false },
};

const errors: Record<string, string> = {
  yetki: "Bu e-posta panelde kayıtlı değil. Bir admin seni eklemeli.",
  baglanti: "Giriş bağlantısı geçersiz ya da süresi dolmuş. Yenisini iste.",
};

export default function LoginPage({ searchParams }: PageProps<"/giris">) {
  return (
    <div className="mx-auto grid max-w-content gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1fr_1.1fr] lg:items-center">
      <div className="space-y-5">
        <p className="font-mono text-sm text-fg-subtle">{"// sudo login"}</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Panel girişi</h1>
        <p className="max-w-md text-lg text-fg-muted">
          Ekip ve içerik yönetimi sadece yetkili hesaplara açık. E-postanı yaz, sana tek kullanımlık
          bir giriş bağlantısı gönderelim; şifre yok.
        </p>
      </div>
      <Suspense>
        <LoginBox searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function LoginBox({ searchParams }: Pick<PageProps<"/giris">, "searchParams">) {
  const params = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const error = errors[one(params.hata) ?? ""];
  return <LoginForm next={one(params.sonra) ?? "/panel"} error={error} />;
}
