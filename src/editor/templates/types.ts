import type { EditorDoc, Layer } from "../types";
import type { SizeKey } from "@/lib/presets";

export type TemplateCategory =
  | "Breaking News"
  | "TV Channel"
  | "Newspaper"
  | "Sports"
  | "Entertainment"
  | "Religious"
  | "Tribute"
  | "Notice"
  | "Quote"
  | "Weather"
  | "Abstract"
  | "Collage"
  | "General";

export interface TemplatePalette {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  textAlt: string;
}

// A template builds its layer stack for a given canvas w x h.
// Every template exposes exactly the three editable zones the source frames use:
// one photo slot, one logo slot, one headline text (plus optional date/site chips).
export interface TemplateDef {
  id: string;
  name: string;
  nameBn: string;
  category: TemplateCategory;
  palette: TemplatePalette;
  tags: string[];
  // Signature add-on element ids surfaced first in the editor's Elements panel
  // for this template (see editor/elements.ts). Optional; falls back to a set
  // derived from the category.
  elements?: string[];
  // returns background fill + ordered layers for this exact pixel size
  build: (w: number, h: number) => Pick<EditorDoc, "background" | "layers">;
}

// Serializable subset safe to pass from server components to client components
// (TemplateDef.build is a function and cannot cross the RSC boundary).
export type TemplateMeta = Omit<TemplateDef, "build">;

export function toMeta(def: TemplateDef): TemplateMeta {
  const { build: _build, ...meta } = def;
  void _build;
  return meta;
}

export function instantiate(def: TemplateDef, size: SizeKey, w: number, h: number): EditorDoc {
  const { background, layers } = def.build(w, h);
  return {
    schemaVersion: 1,
    templateId: def.id,
    size,
    customW: w,
    customH: h,
    background,
    layers: layers as Layer[],
  };
}
