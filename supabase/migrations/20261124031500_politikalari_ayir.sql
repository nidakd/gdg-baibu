-- "for all" kuralları okuma kuralıyla çakışıyordu (Supabase performans uyarısı):
-- yazma kuralları insert / update / delete olarak ayrıldı, okuma tek kuralda kaldı.

drop policy "admin yonetir" on public.panel_users;
create policy "admin ekler" on public.panel_users for insert to authenticated
  with check ((select private.panel_role()) = 'admin');
create policy "admin duzenler" on public.panel_users for update to authenticated
  using ((select private.panel_role()) = 'admin') with check ((select private.panel_role()) = 'admin');
create policy "admin siler" on public.panel_users for delete to authenticated
  using ((select private.panel_role()) = 'admin');

drop policy "admin yazar" on public.teams;
create policy "admin ekler" on public.teams for insert to authenticated
  with check ((select private.panel_role()) = 'admin');
create policy "admin duzenler" on public.teams for update to authenticated
  using ((select private.panel_role()) = 'admin') with check ((select private.panel_role()) = 'admin');
create policy "admin siler" on public.teams for delete to authenticated
  using ((select private.panel_role()) = 'admin');
