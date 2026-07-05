import { makeImage } from "./factories";
import { uid } from "@/lib/utils";
import type { ImageLayer, Layer } from "./types";

// Collage / grid-frame layouts. Each is a set of photo slots expressed as
// fractions of the canvas; building one drops that many independent, editable
// image layers with a small gutter so they read as a grid.

export interface CollageDef {
  id: string;
  label: string;
  slots: [number, number, number, number][]; // x, y, w, h as fractions
}

export const COLLAGES: CollageDef[] = [
  { id: "grid-2x2", label: "2 × 2", slots: [[0, 0, 0.5, 0.5], [0.5, 0, 0.5, 0.5], [0, 0.5, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5]] },
  { id: "rows-3", label: "3 rows", slots: [[0, 0, 1, 1 / 3], [0, 1 / 3, 1, 1 / 3], [0, 2 / 3, 1, 1 / 3]] },
  { id: "cols-3", label: "3 cols", slots: [[0, 0, 1 / 3, 1], [1 / 3, 0, 1 / 3, 1], [2 / 3, 0, 1 / 3, 1]] },
  { id: "hero-left", label: "Big + 2", slots: [[0, 0, 0.6, 1], [0.6, 0, 0.4, 0.5], [0.6, 0.5, 0.4, 0.5]] },
  { id: "hero-top", label: "Hero + 3", slots: [[0, 0, 1, 0.6], [0, 0.6, 1 / 3, 0.4], [1 / 3, 0.6, 1 / 3, 0.4], [2 / 3, 0.6, 1 / 3, 0.4]] },
  { id: "grid-2x3", label: "2 × 3", slots: [[0, 0, 0.5, 1 / 3], [0.5, 0, 0.5, 1 / 3], [0, 1 / 3, 0.5, 1 / 3], [0.5, 1 / 3, 0.5, 1 / 3], [0, 2 / 3, 0.5, 1 / 3], [0.5, 2 / 3, 0.5, 1 / 3]] },
  { id: "left-strip", label: "Strip + big", slots: [[0, 0, 0.35, 0.5], [0, 0.5, 0.35, 0.5], [0.35, 0, 0.65, 1]] },
  { id: "split-2", label: "Split", slots: [[0, 0, 0.5, 1], [0.5, 0, 0.5, 1]] },
];

export function collageById(id: string): CollageDef | undefined {
  return COLLAGES.find((c) => c.id === id);
}

// Build a collage confined to a sub-rectangle of the canvas (used by collage
// templates that also carry a caption band).
export function buildCollageIn(def: CollageDef, rx: number, ry: number, rw: number, rh: number): Layer[] {
  return buildCollage(def, rw, rh).map((l) => ({ ...l, x: l.x + rx, y: l.y + ry }));
}

const GUTTER = 0.012; // fraction of the smaller edge

export function buildCollage(def: CollageDef, w: number, h: number): Layer[] {
  const g = Math.min(w, h) * GUTTER;
  const groupId = uid("cg");
  return def.slots.map((s, i) => {
    const x = s[0] * w + (s[0] > 0 ? g / 2 : 0);
    const y = s[1] * h + (s[1] > 0 ? g / 2 : 0);
    const width = s[2] * w - (s[0] > 0 ? g / 2 : 0) - (s[0] + s[2] < 1 ? g / 2 : 0);
    const height = s[3] * h - (s[1] > 0 ? g / 2 : 0) - (s[1] + s[3] < 1 ? g / 2 : 0);
    return makeImage({
      name: `Collage ${i + 1}`,
      x,
      y,
      width,
      height,
      mask: "rect",
      cornerRadius: 0,
      placeholderLabel: "ছবি",
      groupId,
    }) as ImageLayer;
  });
}
