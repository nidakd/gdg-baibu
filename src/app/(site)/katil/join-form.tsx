"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Window } from "@/components/ui/window";
import { sendApplication, type JoinField, type JoinState } from "./actions";
import { GITHUB_TEAM, MESSAGE_RULES, YEAR_LABELS } from "./fields";

const input =
  "w-full rounded-xl border-2 border-border-strong bg-surface px-3 py-2.5 text-base outline-none focus-visible:ring-2 focus-visible:ring-blue";

/** Core team başvuru formu; sunucuda e-postaya ve panele düşer (actions.ts). */
export function JoinForm({
  teams,
  preselected,
}: {
  teams: { id: string; name: string }[];
  preselected: string | null;
}) {
  const [state, action, pending] = useActionState<JoinState, FormData>(sendApplication, {
    status: "idle",
  });
  const startedAt = useRef<HTMLInputElement>(null);
  const [length, setLength] = useState(state.values?.message?.length ?? 0);
  // Yazılım ve Teknik Ekibi işaretliyse GitHub sorulur
  const [askGithub, setAskGithub] = useState(() =>
    (state.values?.teams ?? (preselected ? [preselected] : [])).includes(GITHUB_TEAM),
  );

  // Bot tuzağı: formun ne zaman açıldığı (tarayıcıda yazılsın)
  useEffect(() => {
    if (startedAt.current) startedAt.current.value = String(Date.now());
  }, [state]);

  if (state.status === "ok") {
    return (
      <Window title="~/katil/basvuru.json" tone="green" meta="gönderildi">
        <div className="space-y-2 p-6 font-mono text-sm" role="status">
          <p className="text-green-ink">✓ 201 Created · başvurun alındı</p>
          <p className="font-sans text-base">
            Başvurunu aldık, teşekkürler! Bilgilerini e-posta adresine de gönderdik. Ekipten biri
            birkaç gün içinde dönecek; o zamana kadar Instagram&apos;dan etkinliklerimizi takip
            edebilirsin.
          </p>
        </div>
      </Window>
    );
  }

  const err = (f: JoinField) => state.errors?.[f];
  const v = state.values ?? {};
  const chosen = new Set(v.teams ?? (preselected ? [preselected] : []));

  return (
    <Window title="~/katil/basvuru.json" tone="blue" meta={pending ? "gönderiliyor…" : "taslak"}>
      <form action={action} className="space-y-5 p-5 sm:p-6" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Ad soyad" htmlFor="j-name" error={err("name")}>
            <input
              id="j-name"
              name="name"
              autoComplete="name"
              required
              maxLength={80}
              defaultValue={v.name}
              className={input}
            />
          </Field>
          <Field label="E-posta" htmlFor="j-email" error={err("email")}>
            <input
              id="j-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={200}
              defaultValue={v.email}
              className={input}
            />
          </Field>
          <Field label="Bölüm" htmlFor="j-dept" error={err("department")}>
            <input
              id="j-dept"
              name="department"
              required
              maxLength={120}
              defaultValue={v.department}
              placeholder="ör. Bilgisayar Mühendisliği"
              className={input}
            />
          </Field>
          <Field label="Sınıf" htmlFor="j-year" error={err("year")}>
            <select id="j-year" name="year" defaultValue={v.year ?? ""} className={input}>
              <option value="">Seç</option>
              {Object.entries(YEAR_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <fieldset className="space-y-2">
          <legend className="font-mono text-xs text-fg-subtle">
            Hangi ekip(ler)? Birden çok seçebilirsin.
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {teams.map((t) => (
              <label
                key={t.id}
                className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-border-strong px-3 py-2.5 has-checked:bg-blue-soft"
              >
                <input
                  type="checkbox"
                  name="teams"
                  value={t.id}
                  defaultChecked={chosen.has(t.id)}
                  onChange={
                    t.id === GITHUB_TEAM ? (e) => setAskGithub(e.target.checked) : undefined
                  }
                  className="size-4"
                />
                <span>{t.name}</span>
              </label>
            ))}
          </div>
          {err("teams") && <p className="text-sm text-red-ink">{err("teams")}</p>}
        </fieldset>

        {askGithub && (
          <Field label="GitHub profilin (isteğe bağlı)" htmlFor="j-github" error={err("github")}>
            <input
              id="j-github"
              name="github"
              inputMode="url"
              autoComplete="off"
              maxLength={100}
              defaultValue={v.github}
              placeholder="github.com/kullanici-adin"
              className={input}
            />
          </Field>
        )}

        <Field
          label="Kendinden biraz bahset (isteğe bağlı, birkaç cümle)"
          htmlFor="j-msg"
          error={err("message")}
        >
          <textarea
            id="j-msg"
            name="message"
            rows={5}
            maxLength={MESSAGE_RULES.max}
            defaultValue={v.message}
            onChange={(e) => setLength(e.target.value.length)}
            placeholder="Neler yapmayı seversin, toplulukta ne yapmak istersin?"
            className={`${input} resize-y`}
          />
          <p className="text-right font-mono text-xs text-fg-subtle">
            {length}/{MESSAGE_RULES.max}
            {length > 0 && length < MESSAGE_RULES.min && ` · en az ${MESSAGE_RULES.min}`}
          </p>
        </Field>

        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="consent" className="mt-0.5 size-4 shrink-0" />
          <span>
            <Link href="/gizlilik" target="_blank" className="underline">
              Aydınlatma metnini
            </Link>{" "}
            okudum. Bilgilerimin bu başvuruyu değerlendirmek ve bana dönmek için GDG on Campus AİBÜ
            yönetimi tarafından işlenmesine ve bu amaçla yurt dışındaki hizmet sağlayıcılarda
            (Supabase, Vercel, Google) saklanmasına açık rıza veriyorum. Bilgiler dönem sonunda
            silinir.
          </span>
        </label>
        {err("consent") && <p className="-mt-3 text-sm text-red-ink">{err("consent")}</p>}

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
            className="rounded-xl border-2 border-red-ink bg-red-soft px-4 py-3 text-sm"
          >
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full border-2 border-border-strong bg-green px-5 py-2.5 text-sm font-medium text-ink-black shadow-sticker-sm transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-sticker active:translate-x-0 active:translate-y-0 active:shadow-none disabled:opacity-60"
        >
          {pending ? "Gönderiliyor…" : "Başvur"}
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
