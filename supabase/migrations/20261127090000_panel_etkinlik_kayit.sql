-- Panelden oluşturulan etkinlikler + etkinlik başına kayıt ayarı + sitedeki kayıt formu.
-- GDG Community'den gelen etkinlikler content/events.json'da kalır; site ikisini birleştirir.

create table public.site_events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}-[a-z0-9-]+$'),
  title text not null check (char_length(title) between 2 and 120),
  starts_at timestamptz not null,
  ends_at timestamptz not null check (ends_at > starts_at),
  format text not null default 'in-person' check (format in ('in-person', 'online')),
  venue text check (char_length(venue) <= 200),
  summary text check (char_length(summary) <= 400),
  description text check (char_length(description) <= 5000),
  cover_url text check (cover_url ~ '^https://'),
  tags text[] not null default '{}',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.site_events enable row level security;
create policy "yayindakileri herkes okur" on public.site_events for select to anon, authenticated
  using (published or (select private.is_panel_user()));
create policy "panel ekler" on public.site_events for insert to authenticated
  with check ((select private.is_panel_user()));
create policy "panel duzenler" on public.site_events for update to authenticated
  using ((select private.is_panel_user())) with check ((select private.is_panel_user()));
create policy "admin siler" on public.site_events for delete to authenticated
  using ((select private.panel_role()) = 'admin');

-- Etkinlik başına kayıt: gdg = GDG Community linki (varsayılan), site = sitedeki form, kapali
create table public.event_registration_settings (
  event_slug text primary key,
  mode text not null default 'gdg' check (mode in ('gdg', 'site', 'kapali')),
  capacity integer check (capacity between 1 and 5000),
  updated_at timestamptz not null default now()
);

alter table public.event_registration_settings enable row level security;
create policy "herkes okur" on public.event_registration_settings for select to anon, authenticated
  using (true);
create policy "panel ekler" on public.event_registration_settings for insert to authenticated
  with check ((select private.is_panel_user()));
create policy "panel duzenler" on public.event_registration_settings for update to authenticated
  using ((select private.is_panel_user())) with check ((select private.is_panel_user()));

-- Kayıtlar: yalnız sunucu gizli anahtarla ekler; panel okur ve iptal eder
create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_slug text not null,
  name text not null check (char_length(name) between 2 and 100),
  email text not null check (char_length(email) <= 254),
  department text check (char_length(department) <= 120),
  created_at timestamptz not null default now(),
  cancelled_at timestamptz
);
create unique index registrations_event_email on public.registrations (event_slug, lower(email));
create index registrations_event on public.registrations (event_slug, created_at);

alter table public.registrations enable row level security;
revoke insert on public.registrations from anon, authenticated;
create policy "panel okur" on public.registrations for select to authenticated
  using ((select private.is_panel_user()));
create policy "panel gunceller" on public.registrations for update to authenticated
  using ((select private.is_panel_user())) with check ((select private.is_panel_user()));
create policy "admin siler" on public.registrations for delete to authenticated
  using ((select private.panel_role()) = 'admin');

-- Sitede "kontenjan: 12/40" için sayı; kişisel veri vermez
create function public.registration_count(slug text) returns integer
  language sql stable security definer set search_path = ''
  as $$ select count(*)::integer from public.registrations where event_slug = slug and cancelled_at is null $$;
grant execute on function public.registration_count(text) to anon, authenticated;

-- Panelden eklenen etkinliklerin afişleri
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('etkinlik', 'etkinlik', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']);
create policy "panel etkinlik afisi yukler" on storage.objects for insert to authenticated
  with check (bucket_id = 'etkinlik' and (select private.is_panel_user()));
create policy "panel etkinlik afisi gunceller" on storage.objects for update to authenticated
  using (bucket_id = 'etkinlik' and (select private.is_panel_user()));
create policy "panel etkinlik afisi siler" on storage.objects for delete to authenticated
  using (bucket_id = 'etkinlik' and (select private.is_panel_user()));
