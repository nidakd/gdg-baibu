"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Window } from "@/components/ui/window";
import { sendContact } from "@/lib/contact";
import { CONTACT_MESSAGE, type ContactField, type ContactState } from "@/lib/contact-state";

// Mesaj kutusu boşken dönen fikir örnekleri
const ideas = [
  "Selam! Sponsor olmak istiyoruz, nasıl ilerleyebiliriz?",
  "Bir atölye fikrim var: …",
  "Bir etkinliğinizde konuşmacı olmak isterim.",
  "Topluluğumuzla ortak bir etkinlik yapalım mı?",
  "Sadece merhaba demek istedim 👋",
];
const MAX = CONTACT_MESSAGE.max;

/** E-posta yazar gibi doldurulan iletişim formu; sunucuda e-postaya çevrilir (lib/contact.ts). */
export function ContactForm({ to }: { to: string }) {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContact, {
    status: "idle",
  });
  const [length, setLength] = useState(state.values?.message?.length ?? 0);
  const [idea, setIdea] = useState(0);
  const startedAt = useRef<HTMLInputElement>(null);

  // Bot tuzağı: formun ne zaman açıldığı (sunucuda değil tarayıcıda yazılsın)
  useEffect(() => {
    if (startedAt.current) startedAt.current.value = String(Date.now());
  }, [state]);

  // Kutu boşken örnek fikirler sırayla değişsin
  useEffect(() => {
    if (length > 0) return;
    const id = setInterval(() => setIdea((i) => (i + 1) % ideas.length), 3500);
    return () => clearInterval(id);
  }, [length]);

  if (state.status === "ok") return <Sent to={to} />;

  const err = (f: ContactField) => state.errors?.[f];
  const v = state.values ?? {};

  return (
    <Window title="yeni-mesaj.eml" tone="yellow" meta={pending ? "gönderiliyor…" : "taslak"}>
      <form action={action} noValidate>
        <div className="divide-y-2 divide-border border-b-2 border-border font-mono text-sm">
          <Row label="kime:">
            <span className="px-1 py-3 text-fg-muted">{to}</span>
          </Row>
          <Row label="kimden:" htmlFor="contact-name" error={err("name")}>
            <input
              id="contact-name"
              name="name"
              autoComplete="name"
              required
              maxLength={80}
              placeholder="Adın soyadın"
              defaultValue={v.name}
              aria-invalid={!!err("name")}
              className="w-full bg-transparent px-1 py-3 font-sans text-base outline-none placeholder:text-fg-subtle"
            />
          </Row>
          <Row label="yanıt:" htmlFor="contact-email" error={err("email")}>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={200}
              placeholder="sen@ornek.com"
              defaultValue={v.email}
              aria-invalid={!!err("email")}
              className="w-full bg-transparent px-1 py-3 font-sans text-base outline-none placeholder:text-fg-subtle"
            />
          </Row>
        </div>

        <label htmlFor="contact-message" className="sr-only">
          Mesajın
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          required
          minLength={CONTACT_MESSAGE.min}
          maxLength={MAX}
          placeholder={ideas[idea]}
          defaultValue={v.message}
          onChange={(e) => setLength(e.target.value.length)}
          aria-invalid={!!err("message")}
          className="block w-full resize-y bg-transparent px-5 py-4 text-base outline-none placeholder:text-fg-subtle"
        />
        {err("message") && <p className="px-5 pb-3 text-sm text-red-ink">{err("message")}</p>}

        {/* Bot tuzakları: görünmez alan ve açılış zamanı */}
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
            className="mx-5 mb-4 rounded-xl border-2 border-red-ink bg-red-soft px-4 py-3 text-sm"
          >
            {state.message}
          </p>
        )}

        {/* Editör durum çubuğu gibi */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-border bg-surface-2 px-5 py-3">
          <span className="font-mono text-xs text-fg-subtle">
            {length > 0 ? "✎ yazıyor" : "boş satır"} · {length}/{MAX} · UTF-8
          </span>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-full border-2 border-border-strong bg-green px-5 py-2 text-sm font-medium text-ink-black shadow-sticker-sm transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-sticker active:translate-x-0 active:translate-y-0 active:shadow-none disabled:opacity-60"
          >
            {pending ? "Gönderiliyor…" : "Gönder"}
            <kbd className="font-mono text-xs opacity-70">⏎</kbd>
          </button>
        </div>
      </form>
      <p className="border-t-2 border-border px-5 py-2.5 text-xs text-fg-subtle">
        Adını ve e-postanı sadece sana dönmek için kullanırız.{" "}
        <Link href="/gizlilik" className="underline">
          Aydınlatma metni
        </Link>
      </p>
    </Window>
  );
}

function Row({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-5">
      <div className="grid grid-cols-[4.5rem_1fr] items-center">
        <label htmlFor={htmlFor} className="text-fg-subtle">
          {label}
        </label>
        {children}
      </div>
      {error && <p className="pb-3 pl-[4.5rem] font-sans text-sm text-red-ink">{error}</p>}
    </div>
  );
}

/** Gönderildi ekranı: zarf uçar, terminal satırları sırayla gelir. */
function Sent({ to }: { to: string }) {
  const lines = [
    <>
      <span className="text-green-ink">$</span> send yeni-mesaj.eml
    </>,
    <>→ {to}</>,
    <span key="ok" className="text-green-ink">
      ✓ 200 OK · mesajın ulaştı
    </span>,
    <>Genelde birkaç gün içinde dönüyoruz. O zamana kadar kahveni tazele ☕</>,
  ];
  return (
    <Window title="yeni-mesaj.eml" tone="green" meta="gönderildi">
      <div className="relative space-y-1.5 overflow-hidden p-6 font-mono text-sm" role="status">
        <span aria-hidden className="absolute top-5 right-6 animate-fly-away text-4xl">
          ✉️
        </span>
        {lines.map((line, i) => (
          <p key={i} className="animate-line-in" style={{ animationDelay: `${0.5 + i * 0.35}s` }}>
            {line}
          </p>
        ))}
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 animate-line-in underline hover:no-underline"
          style={{ animationDelay: "2s" }}
        >
          yeni mesaj yaz
        </button>
      </div>
    </Window>
  );
}
