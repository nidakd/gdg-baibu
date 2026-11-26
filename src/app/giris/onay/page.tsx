import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/brand/logo";
import { codeChoices, parsePending, PENDING_COOKIE, sha256 } from "@/lib/panel/login-requests";
import { adminClient } from "@/lib/supabase/admin";
import { ApproveForm } from "./approve-form";

export const metadata: Metadata = {
  title: "Panel girişini onayla",
  robots: { index: false, follow: false },
};

/** Sayfayı açmak hiçbir şeyi onaylamaz (e-posta önizlemeleri bağlantıyı açabilir); düğme gerekir. */
export default function ApprovePage({ searchParams }: PageProps<"/giris/onay">) {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <Logo className="h-7" />
        <h1 className="text-2xl font-bold tracking-tight">Panel girişini onayla</h1>
        <Suspense>
          <Request searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

/** Sunucuda istek anında bir kez değerlendirilir */
const notExpired = (at: string) => new Date(at).getTime() > Date.now();

async function Request({ searchParams }: Pick<PageProps<"/giris/onay">, "searchParams">) {
  const params = await searchParams;
  const id = typeof params.i === "string" ? params.i : "";
  const key = typeof params.k === "string" ? params.k : "";
  // E-postada seçilen sayı: sayfa bunu kendiliğinden gönderir, burada yeniden sorulmaz
  const picked = typeof params.s === "string" && /^[0-9]{2}$/.test(params.s) ? params.s : undefined;
  const admin = adminClient();
  const { data: row } =
    admin && /^[0-9a-f-]{36}$/.test(id)
      ? await admin
          .from("login_requests")
          .select("browser_hash,approve_hash,code,device,created_at,expires_at,approved_at,used_at")
          .eq("id", id)
          .maybeSingle()
      : { data: null };

  const valid =
    row &&
    row.approve_hash === sha256(key) &&
    !row.used_at &&
    !row.approved_at &&
    notExpired(row.expires_at);
  if (!valid)
    return (
      <div className="space-y-3 rounded-2xl border-2 border-border bg-surface p-5" role="alert">
        <p>Bu bağlantı kullanılmış, iptal edilmiş ya da 15 dakikalık süresi dolmuş.</p>
        <Link href="/giris" className="text-sm font-medium underline">
          Yeni giriş bağlantısı iste
        </Link>
      </div>
    );

  const store = await cookies();
  const pending = parsePending(store.get(PENDING_COOKIE)?.value);
  const sameBrowser = pending?.id === id && sha256(pending.secret) === row.browser_hash;
  const time = new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Istanbul",
  }).format(new Date(row.created_at));

  return (
    <ApproveForm
      id={id}
      k={key}
      device={row.device ?? "Bilinmeyen cihaz"}
      time={time}
      sameBrowser={sameBrowser}
      picked={picked}
      choices={sameBrowser || picked ? [] : codeChoices(row.code)}
    />
  );
}
