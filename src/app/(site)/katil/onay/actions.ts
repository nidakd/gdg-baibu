"use server";

// Başvuranın isteğe bağlı adres doğrulaması: teşekkür e-postasındaki bağlantının anahtarı eşleşirse
// başvuru panelde "onaylı" görünür. Kulübe bildirim başvuru anında gittiği için burada gitmez.
// Bağlantı GET ile değil düğmeyle (POST) onaylanır; e-posta tarayıcılarının bağlantıyı önceden
// açması adresi kendiliğinden doğrulamasın.

import { checkBotId } from "botid/server";
import { rateLimited } from "@/lib/form-guard";
import { adminClient } from "@/lib/supabase/admin";
import { hashToken } from "../notify";

export type ConfirmState = { status: "idle" | "ok" | "expired" | "error" };

export async function confirmApplication(
  _prev: ConfirmState,
  form: FormData,
): Promise<ConfirmState> {
  const token = String(form.get("t") ?? "");
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return { status: "expired" };

  const { isBot } = await checkBotId();
  if (isBot) return { status: "error" };
  if (await rateLimited("onay", 10)) return { status: "error" };

  const admin = adminClient();
  if (!admin) return { status: "error" };
  const { data, error } = await admin
    .from("applications")
    .update({
      email_verified_at: new Date().toISOString(),
      verify_token_hash: null,
      verify_expires_at: null,
    })
    .eq("verify_token_hash", hashToken(token))
    .is("email_verified_at", null)
    .gt("verify_expires_at", new Date().toISOString())
    .select("id")
    .maybeSingle();
  if (error) {
    console.error("[onay] güncellenemedi", error.code);
    return { status: "error" };
  }
  // Kullanılmış ya da süresi dolmuş bağlantı
  if (!data) return { status: "expired" };
  return { status: "ok" };
}
