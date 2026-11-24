-- Yetki yardımcıları API'ye açık olmayan private şemasına taşındı (RPC olarak çağrılamasınlar).
-- team_members okuma kuralı anon için de is_panel_user()'ı çağırıyor (anon'da hep false döner).
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated, anon;
alter function public.panel_role() set schema private;
alter function public.is_panel_user() set schema private;
alter function public.touch_updated_at() set schema private;
grant execute on function private.is_panel_user() to anon;
