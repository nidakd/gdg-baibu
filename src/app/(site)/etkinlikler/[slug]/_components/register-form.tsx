"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { Window } from "@/components/ui/window";
import { registerForEvent, type RegisterField, type RegisterState } from "../actions";

const input =
  "w-full rounded-xl border-2 border-border-strong bg-surface px-3 py-2.5 text-base outline-none focus-visible:ring-2 focus-visible:ring-blue";

/** Sitede kayıt formu (etkinlik "sitede form" moddaysa). */
export function RegisterForm({ slug, left }: { slug: string; left: number | null }) {
  const [state, action, pending] = useActionState<RegisterState, FormData>(registerForEvent, {
    status: "idle",
  });
  const startedAt = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (startedAt.current) startedAt.current.value = String(Date.now());
  }, [state]);

  if (state.status === "ok")
    return (
      <Window title="~/kayit.json" tone="green" meta="kaydedildi">
        <p className="p-6" role="status">
          <span className="block font-mono text-sm text-green-ink">✓ 201 Created</span>
          Kaydını aldık, görüşmek üzere! Ayrıntıları e-posta adresine de gönderdik.
        </p>
      </Window>
    );

  const err = (f: RegisterField) => state.errors?.[f];
  const v = state.values ?? {};
  return (
    <Window
      title="~/kayit.json"
      tone="yellow"
      meta={pending ? "gönderiliyor…" : left !== null ? `${left} yer kaldı` : "açık"}
    >
      <form action={action} className="space-y-5 p-5 sm:p-6" noValidate>
        <input type="hidden" name="slug" value={slug} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Ad soyad" htmlFor="r-name" error={err("name")}>
            <input
              id="r-name"
              name="name"
              autoComplete="name"
              required
              maxLength={80}
              defaultValue={v.name}
              className={input}
            />
          </Field>
          <Field label="E-posta" htmlFor="r-email" error={err("email")}>
            <input
              id="r-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={200}
              defaultValue={v.email}
              className={input}
            />
          </Field>
          <Field label="Bölüm (isteğe bağlı)" htmlFor="r-dept" error={err("department")}>
            <input
              id="r-dept"
              name="department"
              maxLength={120}
              defaultValue={v.department}
              placeholder="ör. Bilgisayar Mühendisliği"
              className={input}
            />
          </Field>
        </div>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="consent" className="mt-0.5 size-4 shrink-0" />
          <span>
            <Link href="/gizlilik" target="_blank" className="underline">
              Aydınlatma metnini
            </Link>{" "}
            okudum; adımın ve e-postamın bu etkinliğin kaydı ve duyuruları için kullanılmasını kabul
            ediyorum.
          </span>
        </label>
        {err("consent") && <p className="-mt-3 text-sm text-red-ink">{err("consent")}</p>}

        <input
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="absolute -left-[9999px] size-px opacity-0"
        />
        <input ref={startedAt} name="startedAt" type="hidden" />

        {state.message && (
          <p
            role="alert"
            className="rounded-xl border-2 border-red-ink bg-red-soft px-4 py-3 text-sm"
          >
            {state.message}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full border-2 border-border-strong bg-yellow px-5 py-2.5 text-sm font-medium text-ink-black shadow-sticker-sm transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-sticker active:translate-x-0 active:translate-y-0 active:shadow-none disabled:opacity-60"
        >
          {pending ? "Gönderiliyor…" : "Kayıt ol"}
        </button>
      </form>
    </Window>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block font-mono text-xs text-fg-subtle">
        {label}
      </label>
      {children}
      {error && <p className="text-sm text-red-ink">{error}</p>}
    </div>
  );
}
