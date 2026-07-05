import type { Layer } from "./types";

export interface Dim {
  w: number;
  h: number;
}

// Does a layer effectively cover the whole canvas (a full-bleed background panel
// or photo)? Those must stretch to the new canvas, not scale uniformly, or the
// resize leaves ugly gutters.
function isFullBleed(l: Layer, from: Dim): boolean {
  return (
    l.x <= from.w * 0.02 &&
    l.y <= from.h * 0.02 &&
    l.x + l.width >= from.w * 0.98 &&
    l.y + l.height >= from.h * 0.98 &&
    l.rotation === 0
  );
}

/**
 * Smart resize ("magic resize"). Reflows every layer from one canvas size to
 * another so nothing gets cropped and the composition keeps its proportions.
 *
 * Rules:
 *  - Full-bleed panels/photos stretch to fill the new canvas exactly.
 *  - Everything else scales by a single uniform factor (min of the two axis
 *    ratios) so aspect ratios are preserved and elements never overflow, then
 *    re-anchors by its relative center so edge-hugging items stay near the same
 *    edge. Font size, corner radius and stroke width scale with it.
 *  - Final positions are clamped to keep each layer inside the new canvas.
 */
export function reflowLayers(layers: Layer[], from: Dim, to: Dim): Layer[] {
  if (from.w <= 0 || from.h <= 0) return layers;
  if (from.w === to.w && from.h === to.h) return layers;
  const s = Math.min(to.w / from.w, to.h / from.h);

  return layers.map((l) => {
    if (isFullBleed(l, from)) {
      return { ...l, x: 0, y: 0, width: to.w, height: to.h } as Layer;
    }

    const relX = (l.x + l.width / 2) / from.w;
    const relY = (l.y + l.height / 2) / from.h;
    const nw = Math.max(4, l.width * s);
    const nh = Math.max(4, l.height * s);
    let nx = relX * to.w - nw / 2;
    let ny = relY * to.h - nh / 2;
    // Keep inside the frame (only clamp when it actually fits).
    if (nw <= to.w) nx = Math.min(Math.max(0, nx), to.w - nw);
    if (nh <= to.h) ny = Math.min(Math.max(0, ny), to.h - nh);

    const base = { ...l, x: nx, y: ny, width: nw, height: nh } as Layer;
    if (base.type === "text") {
      base.fontSize = Math.max(6, Math.round(base.fontSize * s));
    }
    if ("cornerRadius" in base && typeof base.cornerRadius === "number") {
      base.cornerRadius = base.cornerRadius * s;
    }
    if ("stroke" in base && base.stroke) {
      base.stroke = { ...base.stroke, width: Math.max(0.5, base.stroke.width * s) };
    }
    return base;
  });
}
