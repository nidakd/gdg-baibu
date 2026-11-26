-- Panelden yüklenen etkinlik fotoğrafları (Storage "kareler"). Etkinlik galerisinde, on_home ise
-- ana sayfadaki "etkinliklerden kareler" şeridinde de görünür.

create table public.event_photos (
  id uuid primary key default gen_random_uuid(),
  event_slug text not null,
  path text not null unique check (path ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}-[a-z0-9-]+/[a-z0-9-]+\.webp$'),
  url text not null check (url ~ '^https://'),
  alt text not null check (char_length(alt) between 3 and 200),
  width integer not null check (width between 1 and 10000),
  height integer not null check (height between 1 and 10000),
  sort_order integer not null default 100,
  on_home boolean not null default false,
  created_at timestamptz not null default now()
);
create index event_photos_event on public.event_photos (event_slug, sort_order);

alter table public.event_photos enable row level security;
create policy "herkes okur" on public.event_photos for select to anon, authenticated using (true);
create policy "panel ekler" on public.event_photos for insert to authenticated
  with check ((select private.is_panel_user()));
create policy "panel duzenler" on public.event_photos for update to authenticated
  using ((select private.is_panel_user())) with check ((select private.is_panel_user()));
create policy "panel siler" on public.event_photos for delete to authenticated
  using ((select private.is_panel_user()));
create trigger gecmis after insert or update or delete on public.event_photos
  for each row execute function private.log_change();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('kareler', 'kareler', true, 3145728, array['image/webp']);
create policy "panel kare yukler" on storage.objects for insert to authenticated
  with check (bucket_id = 'kareler' and (select private.is_panel_user()));
create policy "panel kare siler" on storage.objects for delete to authenticated
  using (bucket_id = 'kareler' and (select private.is_panel_user()));
-- Silmek için Storage API nesneyi önce okur
create policy "panel kareyi gorur" on storage.objects for select to authenticated
  using (bucket_id = 'kareler' and (select private.is_panel_user()));
