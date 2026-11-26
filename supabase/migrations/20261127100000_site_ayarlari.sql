-- Panelden değişen site ayarları (anahtar → değer). Herkese açık okunur, içine gizli bilgi konmaz.
create table public.site_settings (
  key text primary key check (key ~ '^[a-z_]{2,40}$'),
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by text
);
alter table public.site_settings enable row level security;
create policy "herkes okur" on public.site_settings for select to anon, authenticated using (true);
create policy "panel ekler" on public.site_settings for insert to authenticated
  with check ((select private.is_panel_user()));
create policy "panel duzenler" on public.site_settings for update to authenticated
  using ((select private.is_panel_user())) with check ((select private.is_panel_user()));
