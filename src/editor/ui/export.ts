"use client";
import type { StageHandle } from "../render/Stage";
import type { EditorDoc } from "../types";
import { ensureFontsReady } from "../fonts";
import { downloadBlob } from "@/lib/utils";

function usedFonts(doc: EditorDoc): string[] {
  const set = new Set<string>();
  for (const l of doc.layers) if (l.type === "text") set.add(l.fontFamily);
  set.add("Hind Siliguri");
  return [...set];
}

export async function runExport(
  handle: StageHandle,
  doc: EditorDoc,
  target: { w: number; h: number },
  format: "png" | "jpeg",
  quality: number,
): Promise<Blob> {
  // Fonts MUST be ready or fallback glyphs sneak into the output.
  await ensureFontsReady(usedFonts(doc));
  const blob = await handle.exportBlob({ w: target.w, h: target.h, format, quality });
  return blob;
}

export function exportFilename(doc: EditorDoc, format: "png" | "jpeg", size: string): string {
  const tpl = doc.templateId ?? "custom";
  const stamp = Date.now();
  return `photocard-${tpl}-${size}-${stamp}.${format === "png" ? "png" : "jpg"}`;
}

export async function captureTelemetry(
  blob: Blob,
  doc: EditorDoc,
  size: string,
  format: string,
  dims: { w: number; h: number },
): Promise<void> {
  // Best-effort gallery capture (private build). Never blocks the download.
  // Send the encoded blob as multipart form data. A full-res PNG export is
  // several MB, so base64 + `keepalive` is unusable (keepalive caps the body at
  // 64 KB and silently drops anything larger). Plain multipart has no such cap.
  try {
    if (process.env.NEXT_PUBLIC_EDITION === "public") return;
    const csrf = document.cookie.match(/(?:^|; )pc_csrf=([^;]+)/)?.[1];
    const form = new FormData();
    form.append("image", blob, `export.${format === "png" ? "png" : "jpg"}`);
    if (doc.templateId) form.append("templateId", doc.templateId);
    form.append("sizePreset", size);
    form.append("format", format);
    form.append("width", String(dims.w));
    form.append("height", String(dims.h));
    await fetch("/unavailable/telemetry/export", {
      method: "POST",
      headers: { ...(csrf ? { "x-csrf-token": decodeURIComponent(csrf) } : {}) },
      body: form,
    });
  } catch {
    /* ignore */
  }
}

export { downloadBlob };
