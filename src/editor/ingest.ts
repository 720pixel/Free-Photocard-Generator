"use client";
import imageCompression from "browser-image-compression";

export interface Ingested {
  dataUrl: string;
  width: number;
  height: number;
}

const HARD_LIMIT = 15 * 1024 * 1024;

export async function ingestImage(file: File): Promise<Ingested> {
  if (!file.type.startsWith("image/")) throw new Error("এটি ছবি নয়");
  if (file.size > HARD_LIMIT) throw new Error("ছবি ১৫ এমবির বেশি, ছোট ছবি দিন");

  let working = file;
  if (file.size > 2 * 1024 * 1024) {
    working = await imageCompression(file, {
      maxSizeMB: 2,
      maxWidthOrHeight: 2560,
      useWebWorker: true,
      initialQuality: 0.9,
    });
  }
  const dataUrl = await imageCompression.getDataUrlFromFile(working);
  const dims = await naturalSize(dataUrl);
  return { dataUrl, ...dims };
}

export async function fileFromClipboard(items: DataTransferItemList | ClipboardItems): Promise<File | null> {
  // DataTransferItemList path (paste event)
  if ("length" in items) {
    for (let i = 0; i < (items as DataTransferItemList).length; i++) {
      const it = (items as DataTransferItemList)[i];
      if (it.kind === "file" && it.type.startsWith("image/")) {
        const f = it.getAsFile();
        if (f) return f;
      }
    }
  }
  return null;
}

function naturalSize(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = src;
  });
}
