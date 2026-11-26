"use client";

import Link from "next/link";
import { useActionState } from "react";
import { approveLogin, type ApproveState } from "./actions";

const box = "space-y-4 rounded-2xl border-2 border-border bg-surface p-5";
const primary =
  "inline-flex items-center gap-2 rounded-full border-2 border-border-strong bg-blue px-5 py-2.5 text-sm font-medium text-ink-black shadow-sticker-sm transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-sticker disabled:opacity-60";

type Props = {
  id: string;
  k: string;
  device: string;
  time: string;
  sameBrowser: boolean;
  choices: string[];
};

export function ApproveForm({ id, k, device, time, sameBrowser, choices }: Props) {
  const [state, action, pending] = useActionState<ApproveState, FormData>(approveLogin, {
    status: "idle",
  });

  if (state.status === "approved")
    return (
      <div className={box} role="status">
        <p className="font-medium">
          <span className="text-green-ink">✓</span> Onaylandı
        </p>
        <p className="text-sm text-fg-muted">
          Giriş, {device} üzerindeki sayfada birkaç saniye içinde açılacak. Bu sekmeyi
          kapatabilirsin.
        </p>
      </div>
    );

  if (state.status === "mismatch")
    return (
      <div className={box} role="alert">
        <p className="font-medium">Sayı eşleşmedi, istek iptal edildi.</p>
        <p className="text-sm text-fg-muted">
          Girişi sen istediysen bilgisayarındaki sayfadan yeni bağlantı iste. İstemediysen bir şey
          yapmana gerek yok; kimse giriş yapmadı.
        </p>
      </div>
    );

  if (state.status === "gone")
    return (
      <div className={box} role="alert">
        <p>Bu bağlantı kullanılmış, iptal edilmiş ya da süresi dolmuş.</p>
        <Link href="/giris" className="text-sm font-medium underline">
          Yeni giriş bağlantısı iste
        </Link>
      </div>
    );

  return (
    <form action={action} className={box}>
      <input type="hidden" name="i" value={id} />
      <input type="hidden" name="k" value={k} />
      <p className="text-sm text-fg-muted">
        <b className="text-fg">{device}</b> · saat {time}
      </p>
      {sameBrowser ? (
        <button type="submit" disabled={pending} className={primary}>
          {pending ? "Giriş yapılıyor…" : "Panele gir"}
        </button>
      ) : (
        <fieldset className="space-y-3" disabled={pending}>
          <legend className="text-sm">
            Girişi istediğin sayfada bir sayı görünüyor. Aynı sayıya dokun:
          </legend>
          <div className="flex gap-3">
            {choices.map((c) => (
              <button
                key={c}
                type="submit"
                name="sayi"
                value={c}
                className="flex-1 rounded-xl border-2 border-border-strong bg-surface py-3 font-mono text-2xl font-bold shadow-sticker-sm transition hover:-translate-y-0.5 hover:shadow-sticker disabled:opacity-60"
              >
                {c}
              </button>
            ))}
          </div>
          <p className="text-xs text-fg-subtle">
            Bu isteği sen yapmadıysan hiçbir şeye dokunma; onay vermedikçe kimse giriş yapamaz.
          </p>
        </fieldset>
      )}
    </form>
  );
}
