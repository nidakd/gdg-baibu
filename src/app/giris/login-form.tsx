"use client";

import { useActionState, useEffect, useState } from "react";
import { checkLogin, sendLoginLink, type LoginState } from "./actions";

const POLL_MS = 3000;

/** E-postadaki onay gelene kadar bekler; gelince oturum bu tarayıcıda açılır ve panele geçilir. */
function Waiting({ email, code }: { email?: string; code?: string }) {
  const [gone, setGone] = useState(false);

  useEffect(() => {
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
  }, []);

  if (gone)
    return (
      <div className="space-y-3 rounded-2xl border-2 border-border bg-surface p-5" role="alert">
        <p>Giriş isteğinin süresi doldu ya da iptal edildi.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="text-sm font-medium underline"
        >
          Yeniden dene
        </button>
      </div>
    );

  return (
    <div className="space-y-4 rounded-2xl border-2 border-border bg-surface p-5" role="status">
      <p className="font-medium">
        <span className="text-green-ink">✓</span> Onay bağlantısı gönderildi: {email}
      </p>
      <p className="text-sm text-fg-muted">
        Bu adres panelde kayıtlıysa birkaç dakika içinde bir e-posta gelecek. E-postayı istediğin
        cihazda (telefonda da olur) aç ve bu sayıya dokun:
      </p>
      <p
        className="text-center font-mono text-5xl font-bold tracking-widest"
        aria-label={`Sayı ${code}`}
      >
        {code}
      </p>
      <p className="text-sm text-fg-muted">
        Onaylayınca bu sayfa kendiliğinden panele geçer; bu sekmeyi açık bırak. Bağlantı 15 dakika
        geçerli; e-posta gelmediyse spam klasörüne bak.
      </p>
    </div>
  );
}

export function LoginForm({ next, error }: { next: string; error?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(sendLoginLink, {
    status: "idle",
  });

  if (state.status === "waiting") return <Waiting email={state.email} code={state.code} />;

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
