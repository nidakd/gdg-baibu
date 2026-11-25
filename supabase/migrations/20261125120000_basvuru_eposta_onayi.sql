-- Başvuru e-posta onayı: başvurana tek kullanımlık bağlantı gider, tıklayınca email_verified_at dolar.
-- Bağlantıdaki anahtarın kendisi değil SHA-256 özeti saklanır. Anahtarı sadece sunucu (gizli anahtarla,
-- RLS'i aşarak) yazar; tarayıcıdaki yayınlanabilir anahtar onaylı ya da anahtarlı satır ekleyemez.

alter table public.applications
  add column email_verified_at timestamptz,
  add column verify_token_hash text unique check (verify_token_hash ~ '^[0-9a-f]{64}$'),
  add column verify_expires_at timestamptz;

drop policy "form ekler" on public.applications;
create policy "form ekler" on public.applications for insert to anon, authenticated
  with check (
    status = 'yeni' and notes is null
    and email_verified_at is null and verify_token_hash is null and verify_expires_at is null
  );
