"use server";

import { redirect } from "next/navigation";
import { getEvents } from "@/lib/content";
import { requirePanelUser } from "@/lib/panel/auth";

const UUID = /^[0-9a-f-]{36}$/;

/** Bir etkinliğin koordinatörlerini seçilenlerle değiştirir (panel kullanıcıları; RLS ayrıca kontrol eder). */
export async function setCoordinators(form: FormData) {
  const { supabase } = await requirePanelUser("/panel/etkinlikler");
  const eventId = String(form.get("event") ?? "");
  const term = String(form.get("donem") ?? "");
  const back = `/panel/etkinlikler${/^[0-9]{4}$/.test(term) ? `?donem=${term}` : ""}#e-${eventId}`;
  if (!getEvents().some((e) => e.id === eventId)) redirect(back);

  const chosen = [
    ...new Set(
      form
        .getAll("koordinator")
        .map(String)
        .filter((id) => UUID.test(id)),
    ),
  ].slice(0, 10);
  const del = await supabase.from("event_coordinators").delete().eq("event_id", eventId);
  if (del.error) console.error("[panel] koordinatörler silinemedi", del.error.code);
  else if (chosen.length) {
    const ins = await supabase
      .from("event_coordinators")
      .insert(chosen.map((member_id) => ({ event_id: eventId, member_id })));
    if (ins.error) console.error("[panel] koordinatörler kaydedilemedi", ins.error.code);
  }
  redirect(back);
}
