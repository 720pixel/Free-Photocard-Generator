import type { SizeKey } from "@/lib/presets";

// ---- Fills -----------------------------------------------------------------
export interface GradientStop {
  color: string;
  offset: number; // 0..1
}
export interface Gradient {
  type: "linear" | "radial" | "conic";
  angle: number; // degrees, for linear/conic
  stops: GradientStop[];
}
export type Fill =
  | { kind: "solid"; color: string }
  | { kind: "gradient"; gradient: Gradient }
  | { kind: "none" };

// ---- Effects ----------------------------------------------------------------
export interface Stroke {
  enabled: boolean;
  width: number;
  color: string;
}
export interface Shadow {
  enabled: boolean;
  x: number;
  y: number;
  blur: number;
  color: string;
  opacity: number;
}
export interface Glow {
  enabled: boolean;
  color: string;
  strength: number;
}

// ---- Image adjustments ------------------------------------------------------
export interface Adjustments {
  brightness: number; // -1..1
  contrast: number; // -100..100
  saturation: number; // -2..10
  hue: number; // 0..360
  blur: number; // px
}
export const DEFAULT_ADJ: Adjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
  blur: 0,
};

export type BlendMode =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "soft-light"
  | "hard-light"
  | "color-dodge"
  | "color-burn"
  | "difference"
  | "exclusion"
  | "lighten"
  | "darken"
  | "luminosity";

export type MaskShape =
  | "rect"
  | "rounded"
  | "circle"
  | "torn"
  // Canva-style frame shapes (clip an image to an arbitrary silhouette):
  | "triangle"
  | "diamond"
  | "pentagon"
  | "hexagon"
  | "star"
  | "burst"
  | "heart"
  | "arrow"
  | "blob"
  | "chevron";
export type FitMode = "cover" | "contain";

// Decorative frame drawn around an image layer. Independent from `stroke`
// (a plain border) — frames are multi-part styles (polaroid, film, tape, etc.).
export interface FrameSpec {
  style: string; // one of FRAMES ids
  color: string;
  color2: string; // secondary (mats, tape, accents)
  width: number; // frame thickness in px
}
export type TextRole = "heading" | "subheading" | "date" | "site" | "footer" | "ads" | "custom";
export type LayerType = "shape" | "image" | "logo" | "text" | "decoration";

// ---- Layers -----------------------------------------------------------------
export interface BaseLayer {
  id: string;
  type: LayerType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number; // 0..1
  visible: boolean;
  locked: boolean;
  blend: BlendMode;
  groupId?: string; // layers sharing a groupId move/resize together (collages)
}

// A repeating minimalistic texture painted over a shape's fill. Fully editable:
// color, background, tile size, line weight and opacity.
export interface TextureSpec {
  kind: string; // one of TEXTURE_KINDS ids
  color: string; // foreground ink
  background: string; // "transparent" or a solid color behind the pattern
  scale: number; // tile size in px
  strokeWidth: number; // dot radius / line weight driver
  opacity: number; // pattern alpha 0..1
}

export interface ShapeLayer extends BaseLayer {
  type: "shape" | "decoration";
  shape: "rect" | "rounded" | "circle" | "ellipse" | "triangle" | "path";
  fill: Fill;
  stroke: Stroke;
  cornerRadius: number;
  dash: number[]; // empty = solid
  pathData?: string; // for torn edges / custom svg path (normalized 0..1 space scaled to w/h)
  texture?: TextureSpec | null; // optional repeating overlay pattern
}

// Background behind text: one box or a band per line, optionally frosted.
export interface TextBg {
  enabled: boolean;
  color: string;
  opacity: number;
  radius: number;
  padX: number;
  padY: number;
  perLine: boolean; // true = a band hugging each line (highlight look)
  frost: boolean; // translucent frosted panel behind the text
  blur?: number; // frosted-glass softness (0 = crisp panel)
}

export interface TextLayer extends BaseLayer {
  type: "text";
  role: TextRole;
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  fill: string; // solid color
  align: "left" | "center" | "right";
  vAlign: "top" | "middle" | "bottom";
  stroke: Stroke;
  shadow: Shadow;
  glow: Glow;
  highlight: Fill; // background chip behind text (legacy full-box)
  bg?: TextBg | null; // rich text background (per-line / frosted)
  autoFit: boolean;
  bengaliDigits: boolean; // for date role
}

export interface ImageLayer extends BaseLayer {
  type: "image" | "logo";
  src: string | null; // object URL / data URL; null shows placeholder
  naturalWidth: number;
  naturalHeight: number;
  fit: FitMode;
  offsetX: number; // pan inside mask, 0..1
  offsetY: number;
  zoom: number; // 1 = fit
  mask: MaskShape;
  cornerRadius: number;
  adjustments: Adjustments;
  filterPreset: string | null;
  stroke: Stroke;
  shadow: Shadow;
  overlay: { fill: Fill; blend: BlendMode; opacity: number } | null;
  frame?: FrameSpec | null;
  retouch?: RetouchSpec | null; // masked blur/mosaic (pen + region)
  placeholderLabel: string;
}

// Retouch: a masked blur/mosaic painted over part of a photo (blur a face,
// pixelate a plate). Coordinates are in image-local px (0..width, 0..height).
export interface RetouchStroke {
  points: number[]; // flat [x0,y0,x1,y1,...]
  size: number; // brush diameter
}
export interface RetouchRegion {
  shape: "rect" | "circle";
  x: number;
  y: number;
  w: number;
  h: number;
}
export type RetouchMode = "blur" | "pixelate" | "mosaic";
export interface RetouchSpec {
  mode: RetouchMode;
  intensity: number; // blur radius / pixel size driver
  strokes: RetouchStroke[];
  regions: RetouchRegion[];
}

export type Layer = ShapeLayer | TextLayer | ImageLayer;

// ---- Document ---------------------------------------------------------------
export interface EditorDoc {
  schemaVersion: 1;
  templateId: string | null;
  size: SizeKey | "custom";
  customW: number;
  customH: number;
  background: Fill;
  layers: Layer[]; // bottom -> top
}

export function docDimensions(doc: EditorDoc, presetLookup: (k: SizeKey) => { w: number; h: number }) {
  if (doc.size === "custom") return { w: doc.customW, h: doc.customH };
  const p = presetLookup(doc.size as SizeKey);
  return { w: p.w, h: p.h };
}

// ---- Filter presets (image one-tap) ----------------------------------------
export const FILTER_PRESETS: Record<string, Adjustments> = {
  Vivid: { brightness: 0.05, contrast: 25, saturation: 1.4, hue: 0, blur: 0 },
  "Black & White": { brightness: 0, contrast: 10, saturation: -2, hue: 0, blur: 0 },
  Sepia: { brightness: 0.05, contrast: 5, saturation: -1, hue: 35, blur: 0 },
  Cool: { brightness: 0, contrast: 8, saturation: 0.3, hue: 200, blur: 0 },
  Warm: { brightness: 0.05, contrast: 8, saturation: 0.6, hue: 25, blur: 0 },
  Fade: { brightness: 0.12, contrast: -20, saturation: -0.5, hue: 0, blur: 0 },
  Noir: { brightness: -0.08, contrast: 45, saturation: -2, hue: 0, blur: 0 },
  Pop: { brightness: 0.08, contrast: 35, saturation: 2.2, hue: 0, blur: 0 },
};

export const BLEND_MODES: BlendMode[] = [
  "normal",
  "multiply",
  "screen",
  "overlay",
  "soft-light",
  "hard-light",
  "color-dodge",
  "color-burn",
  "difference",
  "exclusion",
  "lighten",
  "darken",
  "luminosity",
];
