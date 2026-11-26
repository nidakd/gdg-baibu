import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { Logo } from "@/components/brand/logo";
import { parsePending, PENDING_COOKIE, REQUEST_TTL_MS } from "@/lib/panel/login-requests";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Panel girişi",
  robots: { index: false, follow: false },
};

const errors: Record<string, string> = {
  yetki: "Bu e-posta panelde kayıtlı değil. Bir admin seni eklemeli.",
  baglanti: "Giriş bağlantısı geçersiz ya da süresi dolmuş. Yenisini iste.",
};

/** Sitenin çerçevesi olmadan, ortada tek kutu. */
export default function LoginPage({ searchParams }: PageProps<"/giris">) {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <Logo className="h-7" />
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Panel girişi</h1>
          <p className="text-sm text-fg-muted">
            E-postanı yaz, tek kullanımlık bir giriş bağlantısı gönderelim. Şifre yok.
          </p>
        </div>
        <Suspense>
          <LoginBox searchParams={searchParams} />
        </Suspense>
        <Link href="/" className="block text-sm text-fg-muted hover:text-fg">
          ← Siteye dön
        </Link>
      </div>
    </main>
  );
}

/** Sunucuda istek anında bir kez değerlendirilir */
const isFresh = (at: number) => Date.now() - at < REQUEST_TTL_MS;

async function LoginBox({ searchParams }: Pick<PageProps<"/giris">, "searchParams">) {
  const params = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const error = errors[one(params.hata) ?? ""];
  // Bekleyen bir giriş varsa (sayfa yenilendi ya da sekme yeniden açıldı) bekleme ekranına dön
  const pending = parsePending((await cookies()).get(PENDING_COOKIE)?.value);
  const resume =
    pending && !error && isFresh(pending.at)
      ? { status: "waiting" as const, email: pending.email, code: pending.code, at: pending.at }
      : undefined;
  return (
    <LoginForm
      next={resume ? pending!.next : (one(params.sonra) ?? "/panel")}
      error={error}
      resume={resume}
    />
  );
}
