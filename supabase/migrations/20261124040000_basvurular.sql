-- Core team başvuruları (/katil). Site formu ekler; sadece panel kullanıcıları okur ve durumunu değiştirir.

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  email text not null check (char_length(email) between 3 and 200),
  department text check (char_length(department) <= 120),
  year text check (year in ('1', '2', '3', '4', '5', '6', 'hazirlik', 'yuksek-lisans', 'mezun')),
  teams text[] not null default '{}' check (cardinality(teams) between 1 and 5),
  message text check (char_length(message) <= 2000),
  consent boolean not null check (consent),
  status text not null default 'yeni' check (status in ('yeni', 'gorusuldu', 'kabul', 'red')),
  notes text check (char_length(notes) <= 2000),
  created_at timestamptz not null default now()
);
create index applications_created_at_idx on public.applications (created_at desc);

alter table public.applications enable row level security;

-- Form sadece yeni başvuru ekleyebilir (durum ve not panelde verilir)
create policy "form ekler" on public.applications for insert to anon, authenticated
  with check (status = 'yeni' and notes is null);
create policy "panel okur" on public.applications for select to authenticated
  using ((select private.is_panel_user()));
create policy "panel gunceller" on public.applications for update to authenticated
  using ((select private.is_panel_user())) with check ((select private.is_panel_user()));
create policy "admin siler" on public.applications for delete to authenticated
  using ((select private.panel_role()) = 'admin');
