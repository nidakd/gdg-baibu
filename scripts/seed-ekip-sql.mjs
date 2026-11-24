// content/team.json → Supabase seed SQL'i (ekipler ve üyeler). Çıktı stdout'a yazılır.
// Kullanım: node scripts/seed-ekip-sql.mjs > /tmp/seed.sql (Supabase SQL editörüne yapıştır)
// Panel kullanılmaya başlayınca veritabanı asıl kaynak olur; bu betik sadece ilk aktarım için.

import { readFile } from "node:fs/promises";

const team = JSON.parse(await readFile(new URL("../content/team.json", import.meta.url), "utf8"));

const slugify = (text) =>
  text
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const q = (v) => (v === null || v === undefined ? "null" : `'${String(v).replace(/'/g, "''")}'`);

const teams = team.teams.map(
  (t, i) =>
    `(${q(t.id)}, ${q(t.name)}, ${q(t.nameEn)}, ${q(t.kind)}, ${q(t.tone)}, ${q(t.description)}, ${i + 1})`,
);
const members = team.members.map(
  (m) =>
    `(${q(slugify(m.name))}, ${q(m.name)}, ${q(m.role)}, ${q(m.team)}, ${q(m.department)}, ${q(m.year)}, ${q(m.photoUrl)}, ${q(m.bio)}, ${q(JSON.stringify(m.links))}::jsonb, ${m.order})`,
);

console.log(`insert into public.teams (id, name, name_en, kind, tone, description, sort_order) values
${teams.join(",\n")}
on conflict (id) do nothing;

insert into public.team_members (slug, name, role, team_id, department, year, photo_url, bio, links, sort_order) values
${members.join(",\n")}
on conflict (slug) do nothing;`);
