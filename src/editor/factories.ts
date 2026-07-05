import { uid } from "@/lib/utils";
import {
  DEFAULT_ADJ,
  type Fill,
  type ImageLayer,
  type ShapeLayer,
  type TextLayer,
  type TextRole,
  type TextureSpec,
} from "./types";
import { DEFAULT_TEXTURE, textureById } from "./textures";

const noStroke = { enabled: false, width: 4, color: "#000000" };
const noShadow = { enabled: false, x: 0, y: 6, blur: 12, color: "#000000", opacity: 0.35 };
const noGlow = { enabled: false, color: "#ff2d55", strength: 12 };

export function makeText(partial: Partial<TextLayer> = {}): TextLayer {
  return {
    id: uid("t"),
    type: "text",
    role: "custom",
    name: "Text",
    x: 80,
    y: 80,
    width: 520,
    height: 140,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    blend: "normal",
    text: "নতুন টেক্সট",
    fontFamily: "Hind Siliguri",
    fontSize: 64,
    fontWeight: 700,
    lineHeight: 1.15,
    letterSpacing: 0,
    fill: "#111111",
    align: "center",
    vAlign: "top",
    stroke: { ...noStroke },
    shadow: { ...noShadow },
    glow: { ...noGlow },
    highlight: { kind: "none" },
    bg: null,
    autoFit: true,
    bengaliDigits: false,
    ...partial,
  };
}

export const DEFAULT_TEXT_BG = {
  enabled: true,
  color: "#f2b705",
  opacity: 1,
  radius: 6,
  padX: 14,
  padY: 8,
  perLine: true,
  frost: false,
};

export function makeHeading(text: string, partial: Partial<TextLayer> = {}): TextLayer {
  return makeText({
    role: "heading",
    name: "Heading",
    text,
    fontSize: 84,
    fontWeight: 800,
    ...partial,
  });
}

export function makeImage(partial: Partial<ImageLayer> = {}): ImageLayer {
  return {
    id: uid("i"),
    type: "image",
    name: "Photo",
    x: 80,
    y: 400,
    width: 640,
    height: 640,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    blend: "normal",
    src: null,
    naturalWidth: 0,
    naturalHeight: 0,
    fit: "cover",
    offsetX: 0.5,
    offsetY: 0.5,
    zoom: 1,
    mask: "rounded",
    cornerRadius: 24,
    adjustments: { ...DEFAULT_ADJ },
    filterPreset: null,
    stroke: { ...noStroke },
    shadow: { ...noShadow },
    overlay: null,
    placeholderLabel: "ছবি যোগ করুন",
    ...partial,
  };
}

export function makeLogo(partial: Partial<ImageLayer> = {}): ImageLayer {
  return makeImage({
    type: "logo",
    name: "Logo",
    width: 120,
    height: 120,
    mask: "rect",
    fit: "contain",
    cornerRadius: 0,
    placeholderLabel: "লোগো",
    ...partial,
  });
}

export function makeShape(partial: Partial<ShapeLayer> = {}): ShapeLayer {
  return {
    id: uid("s"),
    type: "shape",
    name: "Shape",
    x: 0,
    y: 0,
    width: 300,
    height: 300,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    blend: "normal",
    shape: "rounded",
    fill: { kind: "solid", color: "#7a0c1f" },
    stroke: { ...noStroke },
    cornerRadius: 0,
    dash: [],
    ...partial,
  };
}

// A texture overlay layer: a decoration rect that paints only the repeating
// pattern (no base fill) so it textures whatever sits beneath it.
export function makeTexture(kind: string, partial: Partial<ShapeLayer> = {}): ShapeLayer {
  const def = textureById(kind);
  const texture: TextureSpec = { ...DEFAULT_TEXTURE, kind, ...def.defaults };
  return makeShape({
    type: "decoration",
    name: `Texture · ${def.label}`,
    shape: "rect",
    fill: { kind: "none" },
    texture,
    ...partial,
  });
}

export function solid(color: string): Fill {
  return { kind: "solid", color };
}
export function linear(angle: number, stops: { color: string; offset: number }[]): Fill {
  return { kind: "gradient", gradient: { type: "linear", angle, stops } };
}

// Toggle a fill to gradient WITHOUT changing how it looks: seed both stops from
// the current solid color so the switch is visually a no-op until the user
// actually picks or edits a gradient.
export function asGradientFrom(fill: Fill): Fill {
  if (fill.kind === "gradient") return fill;
  const c = fill.kind === "solid" ? fill.color : "#6d28d9";
  return { kind: "gradient", gradient: { type: "linear", angle: 135, stops: [{ color: c, offset: 0 }, { color: c, offset: 1 }] } };
}

// Toggle back to solid, keeping the first stop's color.
export function asSolidFrom(fill: Fill): Fill {
  if (fill.kind === "solid") return fill;
  const c = fill.kind === "gradient" ? fill.gradient.stops[0]?.color ?? "#ffffff" : "#ffffff";
  return { kind: "solid", color: c };
}

export const TEXT_ROLE_LABELS: Record<TextRole, string> = {
  heading: "শিরোনাম",
  subheading: "উপশিরোনাম",
  date: "তারিখ",
  site: "সাইট",
  footer: "ফুটার",
  ads: "বিজ্ঞাপন",
  custom: "কাস্টম",
};
