"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { browserClient } from "@/lib/supabase/browser";
import { addEventPhotos, type UploadedPhoto } from "./actions";

const MAX_SIDE = 2000;

/** Fotoğrafı tarayıcıda en çok 2000 px'e küçültüp WebP'ye çevirir (telefon fotoğrafları çok büyük). */
async function shrink(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.82));
  if (!blob) throw new Error("dönüştürülemedi");
  return { blob, width, height };
}

/** Birden çok fotoğraf seçilir, küçültülür, Storage'a yüklenir, sonra kaydı yazılır. */
export function PhotoUploader({ slug, title }: { slug: string; title: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function upload(files: FileList) {
    setBusy(true);
    const done: UploadedPhoto[] = [];
    let failed = 0;
    const list = [...files].slice(0, 40);
    for (const [i, file] of list.entries()) {
      setStatus(`${i + 1}/${list.length} yükleniyor…`);
      try {
        const { blob, width, height } = await shrink(file);
        const path = `${slug}/${crypto.randomUUID()}.webp`;
        const { error } = await browserClient()
          .storage.from("kareler")
          .upload(path, blob, { contentType: "image/webp", cacheControl: "31536000" });
        if (error) throw error;
        done.push({ path, width, height, alt: `${title} etkinliğinden bir kare` });
      } catch (err) {
        console.error("[kareler] yüklenemedi", err);
        failed++;
      }
    }
    const saved = done.length ? await addEventPhotos(slug, done) : true;
    setStatus(
      !saved
        ? "Dosyalar yüklendi ama kaydedilemedi; sayfayı yenileyip tekrar dene."
        : `${done.length} fotoğraf eklendi${failed ? `, ${failed} tanesi yüklenemedi` : ""}. Açıklamaları aşağıdan düzenleyebilirsin.`,
    );
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="space-y-3 p-5 sm:p-6">
      <label className="block space-y-2">
        <span className="block text-sm text-fg-muted">
          Birden çok fotoğraf seçebilirsin (JPG, PNG, HEIC değil). Tarayıcıda 2000 px&apos;e
          küçültülüp WebP olarak yüklenir. Yüzü net görünenlerin iznini almayı unutma.
        </span>
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          disabled={busy}
          onChange={(e) => e.target.files?.length && upload(e.target.files)}
          className="text-sm"
        />
      </label>
      {status && (
        <p role="status" className="text-sm">
          {status}
        </p>
      )}
    </div>
  );
}
