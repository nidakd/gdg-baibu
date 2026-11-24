-- Ekip verisi, panel kullanıcıları ve iletişim mesajları.
-- Yetki: panel_users tablosundaki e-postalar (admin | editor). Supabase Auth ile giriş yapan
-- kişinin doğrulanmış e-postası burada yoksa hiçbir şey yazamaz.

create table public.panel_users (
  email text primary key check (email = lower(email)),
  full_name text,
  role text not null default 'editor' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

create table public.teams (
  id text primary key,
  name text not null,
  name_en text not null,
  kind text not null check (kind in ('leadership', 'team')),
  tone text not null,
  description text,
  sort_order int not null default 0
);

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 2 and 100),
  role text not null check (char_length(role) between 1 and 60),
  team_id text not null references public.teams (id) on update cascade,
  department text check (char_length(department) <= 120),
  year text check (year in ('1', '2', '3', '4', '5', '6', 'mezun')),
  photo_url text check (photo_url ~ '^https://'),
  bio text check (char_length(bio) <= 1200),
  links jsonb not null default '{}'::jsonb,
  sort_order int not null default 100,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);
create index team_members_team_id_idx on public.team_members (team_id);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) between 3 and 200),
  message text not null check (char_length(message) between 10 and 3000),
  created_at timestamptz not null default now()
);

-- Yetki yardımcıları: giriş yapan kişinin e-postası panel_users'ta mı?
create or replace function public.panel_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.panel_users
  where email = lower((select auth.jwt() ->> 'email'))
$$;

create or replace function public.is_panel_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.panel_users
    where email = lower((select auth.jwt() ->> 'email'))
  )
$$;

revoke execute on function public.panel_role() from public, anon;
revoke execute on function public.is_panel_user() from public, anon;
grant execute on function public.panel_role() to authenticated;
grant execute on function public.is_panel_user() to authenticated;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger team_members_touch before update on public.team_members
for each row execute function public.touch_updated_at();

alter table public.panel_users enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.contact_messages enable row level security;

-- panel_users: panel kullanıcıları listeyi görür, yalnız admin değiştirir
create policy "panel listeyi gorur" on public.panel_users
  for select to authenticated using ((select public.is_panel_user()));
create policy "admin yonetir" on public.panel_users
  for all to authenticated
  using ((select public.panel_role()) = 'admin')
  with check ((select public.panel_role()) = 'admin');

-- teams: herkes okur, admin yazar
create policy "herkes okur" on public.teams for select to anon, authenticated using (true);
create policy "admin yazar" on public.teams for all to authenticated
  using ((select public.panel_role()) = 'admin')
  with check ((select public.panel_role()) = 'admin');

-- team_members: herkes aktifleri okur, panel hepsini okur; panel ekler/düzenler, yalnız admin siler
create policy "aktifleri herkes okur" on public.team_members
  for select to anon, authenticated using (active or (select public.is_panel_user()));
create policy "panel ekler" on public.team_members
  for insert to authenticated with check ((select public.is_panel_user()));
create policy "panel duzenler" on public.team_members
  for update to authenticated
  using ((select public.is_panel_user())) with check ((select public.is_panel_user()));
create policy "admin siler" on public.team_members
  for delete to authenticated using ((select public.panel_role()) = 'admin');

-- contact_messages: site formu ekler (sunucudan, BotID sonrası), sadece panel okur
create policy "form ekler" on public.contact_messages
  for insert to anon, authenticated with check (true);
create policy "panel okur" on public.contact_messages
  for select to authenticated using ((select public.is_panel_user()));
create policy "admin siler" on public.contact_messages
  for delete to authenticated using ((select public.panel_role()) = 'admin');

-- Fotoğraflar: herkese açık okunan "ekip" kovası, yükleme panel kullanıcılarına
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ekip', 'ekip', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

create policy "panel ekip fotografi yukler" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'ekip' and (select public.is_panel_user()));
create policy "panel ekip fotografi gunceller" on storage.objects
  for update to authenticated
  using (bucket_id = 'ekip' and (select public.is_panel_user()));
create policy "panel ekip fotografi siler" on storage.objects
  for delete to authenticated
  using (bucket_id = 'ekip' and (select public.is_panel_user()));
