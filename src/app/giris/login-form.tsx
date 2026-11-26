"use client";

import { useActionState, useEffect, useState } from "react";
import { cancelLogin, checkLogin, sendLoginLink, type LoginState } from "./actions";

const POLL_MS = 3000;
// lib/panel/login-requests.ts ile aynı (o dosya sunucuya özel: node:crypto)
const REQUEST_TTL_MS = 15 * 60 * 1000;
const RESEND_AFTER_MS = 60 * 1000;

/** "14:32" */
const mmss = (ms: number) => {
  const sec = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
};

type WaitingProps = {
  email: string;
  code: string;
  at: number;
  next: string;
  resend: (form: FormData) => void;
  resending: boolean;
};

/**
 * E-postadaki onay gelene kadar bekler; gelince oturum bu tarayıcıda açılır ve panele geçilir.
 * Sayfa yenilense de (çerezden) geri gelir. Geri sayım, yeniden gönder ve farklı e-posta burada.
 */
function Waiting({ email, code, at, next, resend, resending }: WaitingProps) {
  const [gone, setGone] = useState(false);
  const [now, setNow] = useState(at);
  const left = at + REQUEST_TTL_MS - now;
  const expired = gone || left <= 0;
  const canResend = expired || now - at >= RESEND_AFTER_MS;

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (expired) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const poll = async () => {
      clearTimeout(timer);
      try {
        const r = await checkLogin();
        if (stopped) return;
        if (r.status === "done") return window.location.assign(r.next ?? "/panel");
        if (r.status === "gone") return setGone(true);
      } catch {
        // ağ hatası: bir sonraki turda yeniden dene
      }
      if (!stopped) timer = setTimeout(poll, POLL_MS);
    };
    timer = setTimeout(poll, POLL_MS);
    // Sekmeye dönülünce beklemeden sor (arka plandaki sekmelerde zamanlayıcı yavaşlar)
    const onVisible = () => document.visibilityState === "visible" && poll();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [expired, at]);

  const otherEmail = async () => {
    await cancelLogin();
    window.location.reload();
  };

  return (
    <div className="space-y-4 rounded-2xl border-2 border-border bg-surface p-5" role="status">
      {expired ? (
        <p className="font-medium">Giriş isteğinin süresi doldu ya da iptal edildi.</p>
      ) : (
        <>
          <p className="font-medium">
            <span className="text-green-ink">✓</span> Onay bağlantısı gönderildi: {email}
          </p>
          <p className="text-sm text-fg-muted">
            Bu adres panelde kayıtlıysa birkaç dakika içinde bir e-posta gelecek. E-postayı
            istediğin cihazda (telefonda da olur) aç ve bu sayıyı seç:
          </p>
          <p
            className="text-center font-mono text-5xl font-bold tracking-widest"
            aria-label={`Sayı ${code}`}
          >
            {code}
          </p>
          <p className="text-sm text-fg-muted">
            Onaylayınca bu sayfa kendiliğinden panele geçer. Gelmediyse spam klasörüne bak.
          </p>
          <p className="font-mono text-xs text-fg-subtle" aria-live="off">
            Kalan süre {mmss(left)}
          </p>
        </>
      )}
      <form action={resend} className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="sonra" value={next} />
        <button
          type="submit"
          disabled={!canResend || resending}
          className="font-medium underline disabled:no-underline disabled:opacity-50"
        >
          {resending
            ? "Gönderiliyor…"
            : canResend
              ? "Yeni bağlantı gönder"
              : `Yeniden gönder (${mmss(at + RESEND_AFTER_MS - now)})`}
        </button>
        <button type="button" onClick={otherEmail} className="text-fg-muted underline">
          Farklı e-posta
        </button>
      </form>
    </div>
  );
}

type Props = { next: string; error?: string; resume?: LoginState };

export function LoginForm({ next, error, resume }: Props) {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    sendLoginLink,
    resume ?? { status: "idle" },
  );

  if (state.status === "waiting" && state.email && state.code && state.at)
    return (
      <Waiting
        key={state.at}
        email={state.email}
        code={state.code}
        at={state.at}
        next={next}
        resend={action}
        resending={pending}
      />
    );

  if (state.status === "sent") {
    return (
      <div className="space-y-2 rounded-2xl border-2 border-border bg-surface p-5" role="status">
        <p className="font-medium">
          <span className="text-green-ink">✓</span> Bağlantı gönderildi: {state.email}
        </p>
        <p className="text-sm text-fg-muted">
          Bu adres panelde kayıtlıysa birkaç dakika içinde bir giriş bağlantısı gelecek. Bağlantı
          bir saat geçerli ve tek kullanımlık. Gelmediyse spam klasörüne bak.
        </p>
      </div>
    );
  }

  const message = state.message ?? error;
  return (
    <form
      action={action}
      className="space-y-4 rounded-2xl border-2 border-border bg-surface p-5"
      noValidate
    >
      <input type="hidden" name="sonra" value={next} />
      <label htmlFor="login-email" className="block text-sm font-medium">
        E-posta
      </label>
      <input
        id="login-email"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.email}
        placeholder="sen@ornek.com"
        className="w-full rounded-xl border-2 border-border-strong bg-surface px-4 py-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-blue"
      />
      {message && (
        <p
          role="alert"
          className="rounded-xl border-2 border-red-ink bg-red-soft px-4 py-3 text-sm"
        >
          {message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-full border-2 border-border-strong bg-blue px-5 py-2.5 text-sm font-medium text-ink-black shadow-sticker-sm transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-sticker disabled:opacity-60"
      >
        {pending ? "Gönderiliyor…" : "Giriş bağlantısı gönder"}
      </button>
    </form>
  );
}
