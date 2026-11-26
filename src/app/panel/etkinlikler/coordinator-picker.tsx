"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState, useTransition } from "react";
import { saveCoordinators } from "./actions";

type Option = { id: string; name: string };
type Status = "idle" | "saving" | "saved" | "error";

/** Bekleme olmadan art arda tıklanınca tek kayıt gitsin */
const SAVE_DELAY_MS = 600;

/**
 * Koordinatör seçimi: tıklanınca ekranda hemen değişir, kısa bir aradan sonra arkada kaydedilir.
 * Kayıt bitince sayfanın üstündeki grafikler de arkada tazelenir (beklemeden).
 */
export function CoordinatorPicker({
  eventId,
  options,
  initial,
  children,
}: {
  eventId: string;
  options: Option[];
  initial: string[];
  children: ReactNode;
}) {
  const router = useRouter();
  const [chosen, setChosen] = useState(initial);
  const [status, setStatus] = useState<Status>("idle");
  const [, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const latest = useRef(initial);

  useEffect(() => () => clearTimeout(timer.current), []);

  const toggle = (id: string) => {
    const next = chosen.includes(id) ? chosen.filter((x) => x !== id) : [...chosen, id];
    setChosen(next);
    latest.current = next;
    setStatus("saving");
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const sent = latest.current;
      const ok = await saveCoordinators(eventId, sent).catch(() => false);
      // Bu arada yeni tıklama olduysa sonucu onun kaydı söyler
      if (latest.current !== sent) return;
      setStatus(ok ? "saved" : "error");
      if (ok) startTransition(() => router.refresh());
    }, SAVE_DELAY_MS);
  };

  const name = new Map(options.map((o) => [o.id, o.name]));
  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        {children}
        <p className="text-sm">
          {chosen.length ? (
            chosen.map((id) => name.get(id) ?? "?").join(", ")
          ) : (
            <span className="text-fg-subtle">koordinatör yok</span>
          )}
        </p>
      </div>
      <details className="text-sm">
        <summary className="cursor-pointer text-fg-muted hover:text-fg">
          Koordinatörleri düzenle
          <span className="ml-2 font-mono text-xs" aria-live="polite">
            {status === "saving" && <span className="text-fg-subtle">kaydediliyor…</span>}
            {status === "saved" && <span className="text-green-ink">✓ kaydedildi</span>}
            {status === "error" && <span className="text-red-ink">kaydedilemedi, tekrar dene</span>}
          </span>
        </summary>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Koordinatörler">
          {options.map((m) => {
            const on = chosen.includes(m.id);
            return (
              <button
                key={m.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(m.id)}
                className={`rounded-full border-2 px-3 py-1 transition ${
                  on
                    ? "border-border-strong bg-blue-soft font-medium"
                    : "border-border hover:bg-surface-2"
                }`}
              >
                {on ? "✓ " : ""}
                {m.name}
              </button>
            );
          })}
        </div>
      </details>
    </>
  );
}
