"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Window } from "@/components/ui/window";
import { confirmApplication, type ConfirmState } from "./actions";

const button =
  "inline-flex items-center gap-2 rounded-full border-2 border-border-strong bg-green px-5 py-2.5 text-sm font-medium text-ink-black shadow-sticker-sm transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-sticker active:translate-x-0 active:translate-y-0 active:shadow-none disabled:opacity-60";

/** Teşekkür e-postasındaki bağlantıdan gelen kişi düğmeye basınca adresi doğrulanır. */
export function ConfirmForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<ConfirmState, FormData>(confirmApplication, {
    status: "idle",
  });

  if (state.status === "ok")
    return (
      <Window title="~/katil/onay" tone="green" meta="doğrulandı">
        <div className="space-y-2 p-6 font-mono text-sm" role="status">
          <p className="text-green-ink">✓ 200 OK · e-posta adresin doğrulandı</p>
          <p className="font-sans text-base">
            Teşekkürler! Sana bu adresten ulaşacağız; başvurun değerlendirmede.
          </p>
        </div>
      </Window>
    );

  if (state.status === "expired")
    return (
      <Window title="~/katil/onay" tone="yellow" meta="410">
        <div className="space-y-3 p-6" role="alert">
          <p className="font-mono text-sm">410 Gone · bağlantı geçersiz</p>
          <p>
            Bu bağlantı kullanılmış ya da 48 saatlik süresi dolmuş. Daha önce onayladıysan başvurun
            bize ulaştı; onaylamadıysan formu yeniden doldurabilirsin.
          </p>
          <Link href="/katil" className={button}>
            Forma dön
          </Link>
        </div>
      </Window>
    );

  return (
    <Window title="~/katil/onay" tone="blue" meta={pending ? "doğrulanıyor…" : "bekliyor"}>
      <form action={action} className="space-y-4 p-6">
        <input type="hidden" name="t" value={token} />
        <p>
          Başvurunu tamamlamak için e-posta adresini onayla. Bu başvuruyu sen yapmadıysan bu sayfayı
          kapatman yeterli.
        </p>
        {state.status === "error" && (
          <p
            role="alert"
            className="rounded-xl border-2 border-red-ink bg-red-soft px-4 py-3 text-sm"
          >
            Şu an doğrulanamadı. Biraz sonra tekrar dene.
          </p>
        )}
        <button type="submit" disabled={pending} className={button}>
          {pending ? "Doğrulanıyor…" : "Adresimi doğrula"}
        </button>
      </form>
    </Window>
  );
}
