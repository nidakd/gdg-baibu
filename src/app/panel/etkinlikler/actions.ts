"use server";

import { getEvents } from "@/lib/content";
import { requirePanelUser } from "@/lib/panel/auth";

const UUID = /^[0-9a-f-]{36}$/;

/**
 * Bir etkinliğin koordinatörlerini verilen listeyle değiştirir (panel kullanıcıları; RLS ayrıca
 * kontrol eder). Sayfayı yeniden çizdirmez: seçim ekranda anında görünür, kayıt arkada gider.
 */
export async function saveCoordinators(eventId: string, memberIds: string[]): Promise<boolean> {
  const { supabase } = await requirePanelUser("/panel/etkinlikler");
  if (!getEvents().some((e) => e.id === eventId)) return false;
  const chosen = [...new Set(memberIds.filter((id) => UUID.test(id)))].slice(0, 10);

  const del = await supabase.from("event_coordinators").delete().eq("event_id", eventId);
  if (del.error) {
    console.error("[panel] koordinatörler silinemedi", del.error.code);
    return false;
  }
  if (!chosen.length) return true;
  const ins = await supabase
    .from("event_coordinators")
    .insert(chosen.map((member_id) => ({ event_id: eventId, member_id })));
  if (ins.error) console.error("[panel] koordinatörler kaydedilemedi", ins.error.code);
  return !ins.error;
}
