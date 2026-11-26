-- Değişiklik geçmişi: panelde kim neyi ne zaman ekledi / değiştirdi / sildi. Tetikleyicilerle yazılır,
-- sadece admin okur. Formdan gelen kayıtların eklenmesi loglanmaz (kişisel veri birikmesin).

create table public.audit_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  actor text not null,
  action text not null check (action in ('ekle', 'guncelle', 'sil')),
  entity text not null,
  entity_id text,
  label text
);
create index audit_log_at on public.audit_log (at desc);

alter table public.audit_log enable row level security;
revoke insert, update, delete on public.audit_log from anon, authenticated;
create policy "admin okur" on public.audit_log for select to authenticated
  using ((select private.panel_role()) = 'admin');

create function private.log_change() returns trigger
  language plpgsql security definer set search_path = ''
as $$
declare
  r jsonb;
  claims jsonb := nullif(current_setting('request.jwt.claims', true), '')::jsonb;
begin
  if tg_op = 'DELETE' then r := to_jsonb(old); else r := to_jsonb(new); end if;
  insert into public.audit_log (actor, action, entity, entity_id, label)
  values (
    coalesce(claims ->> 'email', 'sistem'),
    case tg_op when 'INSERT' then 'ekle' when 'UPDATE' then 'guncelle' else 'sil' end,
    tg_table_name,
    coalesce(r ->> 'id', r ->> 'event_id', r ->> 'email', r ->> 'key', r ->> 'event_slug'),
    left(coalesce(r ->> 'title', r ->> 'name', r ->> 'full_name', r ->> 'key', r ->> 'event_slug', r ->> 'email'), 120)
  );
  return null;
end;
$$;

create trigger gecmis after insert or update or delete on public.teams for each row execute function private.log_change();
create trigger gecmis after insert or update or delete on public.team_members for each row execute function private.log_change();
create trigger gecmis after insert or update or delete on public.site_events for each row execute function private.log_change();
create trigger gecmis after insert or update or delete on public.event_registration_settings for each row execute function private.log_change();
create trigger gecmis after insert or update or delete on public.posts for each row execute function private.log_change();
create trigger gecmis after insert or update or delete on public.site_settings for each row execute function private.log_change();
create trigger gecmis after insert or update or delete on public.panel_users for each row execute function private.log_change();
create trigger gecmis after insert or delete on public.event_coordinators for each row execute function private.log_change();
create trigger gecmis after update or delete on public.applications for each row execute function private.log_change();
create trigger gecmis after update or delete on public.registrations for each row execute function private.log_change();
create trigger gecmis after delete on public.contact_messages for each row execute function private.log_change();
