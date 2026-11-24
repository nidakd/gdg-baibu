// Oturumlu istemci: panel ve giriş. Supabase oturumu çerezlerde tutulur (@supabase/ssr).
// Panelde her yazma işlemi giriş yapan kişinin yetkisiyle çalışır; RLS izin vermezse reddedilir.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_KEY, SUPABASE_URL } from "./env";

export async function serverClient() {
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          // Sunucu bileşeninden çağrıldıysa çerez yazılamaz; oturumu proxy yeniler
        }
      },
    },
  });
}
