-- Duyurular, projeler ve kaynaklar tek tabloda (kind ile ayrılır). Yayındakileri herkes okur.
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('duyuru', 'proje', 'kaynak')),
  title text not null check (char_length(title) between 2 and 120),
  summary text check (char_length(summary) <= 400),
  body text check (char_length(body) <= 8000),
  url text check (url ~ '^https://'),
  repo_url text check (repo_url ~ '^https://'),
  cover_url text check (cover_url ~ '^https://'),
  event_slug text,
  tags text[] not null default '{}',
  published boolean not null default false,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index posts_kind_published on public.posts (kind, published, published_at desc);

alter table public.posts enable row level security;
create policy "yayindakileri herkes okur" on public.posts for select to anon, authenticated
  using (published or (select private.is_panel_user()));
create policy "panel ekler" on public.posts for insert to authenticated
  with check ((select private.is_panel_user()));
create policy "panel duzenler" on public.posts for update to authenticated
  using ((select private.is_panel_user())) with check ((select private.is_panel_user()));
create policy "admin siler" on public.posts for delete to authenticated
  using ((select private.panel_role()) = 'admin');
