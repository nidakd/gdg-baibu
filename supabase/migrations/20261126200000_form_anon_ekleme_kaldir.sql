-- Form kayıtlarını artık yalnız sunucu gizli anahtarla yazar; tarayıcı anahtarıyla doğrudan ekleme kapanır
drop policy if exists "form ekler" on public.applications;
drop policy if exists "form ekler" on public.contact_messages;
