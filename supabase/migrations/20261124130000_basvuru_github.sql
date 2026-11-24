-- Yazılım ve Teknik Ekibi'ne başvuranlardan GitHub profili (isteğe bağlı), https://github.com/<kullanıcı> biçiminde.
alter table public.applications
  add column github text check (github ~ '^https://github\.com/[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$');
