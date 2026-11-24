"use client";

import { useActionState } from "react";
import { Window } from "@/components/ui/window";
import { sendLoginLink, type LoginState } from "./actions";

export function LoginForm({ next, error }: { next: string; error?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(sendLoginLink, {
    status: "idle",
  });

  if (state.status === "sent") {
    return (
      <Window title="~/panel/giris" tone="green" meta="gönderildi">
        <div className="space-y-2 p-6 font-mono text-sm" role="status">
          <p>
            <span className="text-green-ink">✓</span> {state.email}
          </p>
          <p className="font-sans text-base">
            Bu adres panelde kayıtlıysa birkaç dakika içinde bir giriş bağlantısı gelecek. Bağlantı
            bir saat geçerli ve tek kullanımlık. Gelmediyse spam klasörüne bak.
          </p>
        </div>
      </Window>
    );
  }

  const message = state.message ?? error;
  return (
    <Window title="~/panel/giris" tone="blue" meta={pending ? "gönderiliyor…" : "sudo"}>
      <form action={action} className="space-y-4 p-6" noValidate>
        <input type="hidden" name="sonra" value={next} />
        <label htmlFor="login-email" className="block font-mono text-sm text-fg-subtle">
          e-posta:
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
    </Window>
  );
}
