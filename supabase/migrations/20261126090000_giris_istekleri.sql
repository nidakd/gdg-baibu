-- Cihazlar arası panel girişi: giriş, bağlantının istendiği tarayıcıda açılır; e-postadaki bağlantı
-- (telefonda bile açılsa) sadece onay verir. Satırları yalnız sunucu gizli anahtarla okur/yazar:
-- RLS açık ve hiç politika yok, yani yayınlanabilir anahtarla erişim yok.
-- Tarayıcı ve e-posta anahtarlarının kendisi değil SHA-256 özetleri saklanır.

create table public.login_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  browser_hash text not null check (browser_hash ~ '^[0-9a-f]{64}$'),
  approve_hash text not null unique check (approve_hash ~ '^[0-9a-f]{64}$'),
  -- Supabase'in tek kullanımlık giriş anahtarı; onaydan sonra istenen tarayıcıda oturuma çevrilir
  token_hash text not null,
  -- Her iki ekranda görünen eşleştirme sayısı
  code text not null check (code ~ '^[0-9]{2}$'),
  device text,
  next_path text not null default '/panel',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '15 minutes',
  approved_at timestamptz,
  used_at timestamptz
);

alter table public.login_requests enable row level security;
revoke all on public.login_requests from anon, authenticated;

create index login_requests_created_at on public.login_requests (created_at);
