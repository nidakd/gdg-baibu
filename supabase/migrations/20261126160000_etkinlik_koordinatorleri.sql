-- Etkinlik koordinatörleri: hangi etkinliği core team'den kimlerin koordine ettiği (bir etkinliğe
-- birden çok kişi). Etkinliklerin kendisi content/events.json'da (GDG Community'den eşitlenir);
-- event_id oradaki id'dir. Sadece panel kullanıcıları okur ve yazar.

create table public.event_coordinators (
  event_id text not null check (event_id ~ '^[0-9]{1,12}$'),
  member_id uuid not null references public.team_members (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, member_id)
);
create index event_coordinators_member_id_idx on public.event_coordinators (member_id);

alter table public.event_coordinators enable row level security;

create policy "panel okur" on public.event_coordinators for select to authenticated
  using ((select private.is_panel_user()));
create policy "panel ekler" on public.event_coordinators for insert to authenticated
  with check ((select private.is_panel_user()));
create policy "panel siler" on public.event_coordinators for delete to authenticated
  using ((select private.is_panel_user()));
