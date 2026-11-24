"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Avatar } from "@/components/team/avatar";
import { Window } from "@/components/ui/window";
import { saveMember, type MemberField, type MemberFormState } from "./actions";
import { BIO_HINT, BIO_MAX, LINK_KEYS, LINK_LABELS, ROLES, YEARS } from "./fields";

export type MemberValues = {
  id?: string;
  slug?: string;
  name: string;
  role: string;
  team_id: string;
  department: string | null;
  year: string | null;
  photo_url: string | null;
  bio: string | null;
  links: Partial<Record<string, string>>;
  sort_order: number;
  active: boolean;
};

const input =
  "w-full rounded-xl border-2 border-border-strong bg-surface px-3 py-2.5 text-base outline-none focus-visible:ring-2 focus-visible:ring-blue";

export function MemberForm({
  member,
  teams,
}: {
  member: MemberValues;
  teams: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState<MemberFormState, FormData>(saveMember, {
    status: "idle",
  });
  const [bio, setBio] = useState(member.bio ?? "");
  const [preview, setPreview] = useState<string | null>(null);
  const err = (f: MemberField) => state.errors?.[f];

  return (
    <form action={action} className="space-y-6" noValidate>
      {member.id && <input type="hidden" name="id" value={member.id} />}
      {member.slug && <input type="hidden" name="slug" value={member.slug} />}

      <Window
        title={member.id ? `~/ekip/${member.slug}.json` : "~/ekip/yeni-uye.json"}
        tone="blue"
        meta={pending ? "kaydediliyor…" : undefined}
      >
        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <Field label="Ad soyad" htmlFor="name" error={err("name")}>
            <input id="name" name="name" required defaultValue={member.name} className={input} />
          </Field>
          <Field label="Görev" htmlFor="role" error={err("role")}>
            <input
              id="role"
              name="role"
              list="roller"
              required
              defaultValue={member.role}
              className={input}
            />
            <datalist id="roller">
              {ROLES.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </Field>
          <Field label="Ekip" htmlFor="team_id" error={err("team_id")}>
            <select id="team_id" name="team_id" defaultValue={member.team_id} className={input}>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Sıra (küçük önce)" htmlFor="sort_order" error={err("sort_order")}>
            <input
              id="sort_order"
              name="sort_order"
              type="number"
              min={0}
              max={999}
              defaultValue={member.sort_order}
              className={input}
            />
          </Field>
          <Field label="Bölüm" htmlFor="department" error={err("department")}>
            <input
              id="department"
              name="department"
              defaultValue={member.department ?? ""}
              className={input}
            />
          </Field>
          <Field label="Sınıf" htmlFor="year" error={err("year")}>
            <select id="year" name="year" defaultValue={member.year ?? ""} className={input}>
              <option value="">—</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y === "mezun" ? "mezun" : `${y}. sınıf`}
                </option>
              ))}
            </select>
          </Field>

          <div className="sm:col-span-2">
            <Field
              label={`Tanıtım yazısı · ${bio.length}/${BIO_HINT}${bio.length > BIO_HINT ? " (uzun)" : ""}`}
              htmlFor="bio"
              error={err("bio")}
            >
              <textarea
                id="bio"
                name="bio"
                rows={6}
                maxLength={BIO_MAX}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className={`${input} resize-y`}
              />
            </Field>
          </div>

          <div className="flex items-center gap-4 sm:col-span-2">
            {preview ? (
              // Seçilen dosyanın önizlemesi (blob: adresi next/image'e verilemez)
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt=""
                className="size-18 shrink-0 rounded-full border-2 border-border-strong object-cover"
              />
            ) : (
              <Avatar name={member.name || "?"} photoUrl={member.photo_url} size={72} />
            )}
            <Field
              label="Fotoğraf (JPG, PNG, WebP · en çok 4 MB · kare olsun)"
              htmlFor="photo"
              error={err("photo")}
            >
              <input
                id="photo"
                name="photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setPreview(file ? URL.createObjectURL(file) : null);
                }}
                className="text-sm"
              />
            </Field>
          </div>
        </div>
      </Window>

      <Window title="bağlantılar" tone="lilac">
        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
          {LINK_KEYS.map((key) => (
            <Field key={key} label={LINK_LABELS[key]} htmlFor={`link_${key}`}>
              <input
                id={`link_${key}`}
                name={`link_${key}`}
                type="url"
                inputMode="url"
                placeholder="https://"
                defaultValue={member.links[key] ?? ""}
                className={input}
              />
            </Field>
          ))}
          {err("links") && <p className="text-sm text-red-ink sm:col-span-2">{err("links")}</p>}
        </div>
      </Window>

      <label className="flex items-center gap-3">
        <input type="checkbox" name="active" defaultChecked={member.active} className="size-5" />
        <span>Sitede görünsün (aktif üye)</span>
      </label>

      {state.message && (
        <p
          role="alert"
          className="rounded-xl border-2 border-red-ink bg-red-soft px-4 py-3 text-sm"
        >
          {state.message}
        </p>
      )}
      {state.status === "error" && !state.message && (
        <p role="alert" className="text-sm text-red-ink">
          Bazı alanlar hatalı, yukarıda işaretli.
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full border-2 border-border-strong bg-green px-5 py-2.5 text-sm font-medium text-ink-black shadow-sticker-sm transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-sticker disabled:opacity-60"
        >
          {pending ? "Kaydediliyor…" : "Kaydet"}
        </button>
        <Link
          href="/panel/ekip"
          className="rounded-full border-2 border-border-strong px-5 py-2.5 text-sm"
        >
          Vazgeç
        </Link>
      </div>
    </form>
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
    <div className="min-w-0 flex-1 space-y-1.5">
      <label htmlFor={htmlFor} className="block font-mono text-xs text-fg-subtle">
        {label}
      </label>
      {children}
      {error && <p className="text-sm text-red-ink">{error}</p>}
    </div>
  );
}
