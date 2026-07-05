import type { Fill, Gradient } from "../types";

// Convert our Fill model into Konva shape props for a box of width w, height h.
export function fillProps(fill: Fill, w: number, h: number): Record<string, unknown> {
  if (fill.kind === "none") return { fill: undefined, fillEnabled: false };
  if (fill.kind === "solid") return { fill: fill.color };
  return gradientProps(fill.gradient, w, h);
}

export function gradientProps(g: Gradient, w: number, h: number): Record<string, unknown> {
  const stops: (number | string)[] = [];
  for (const s of g.stops) {
    stops.push(s.offset, s.color);
  }
  if (g.type === "radial") {
    const r = Math.max(w, h) / 2;
    return {
      fillRadialGradientStartPoint: { x: w / 2, y: h / 2 },
      fillRadialGradientEndPoint: { x: w / 2, y: h / 2 },
      fillRadialGradientStartRadius: 0,
      fillRadialGradientEndRadius: r,
      fillRadialGradientColorStops: stops,
    };
  }
  if (g.type === "conic") {
    // Konva has no conic gradient; render one into an offscreen canvas as a pattern.
    const img = conicCanvas(g, Math.max(2, Math.round(w)), Math.max(2, Math.round(h)));
    return { fillPatternImage: img, fillPatternScaleX: 1, fillPatternScaleY: 1, fillPatternRepeat: "no-repeat" };
  }
  // linear
  const rad = (g.angle * Math.PI) / 180;
  const dx = Math.cos(rad);
  const dy = Math.sin(rad);
  return {
    fillLinearGradientStartPoint: { x: w / 2 - (dx * w) / 2, y: h / 2 - (dy * h) / 2 },
    fillLinearGradientEndPoint: { x: w / 2 + (dx * w) / 2, y: h / 2 + (dy * h) / 2 },
    fillLinearGradientColorStops: stops,
  };
}

function conicCanvas(g: Gradient, w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d") as CanvasRenderingContext2D & {
    createConicGradient?: (startAngle: number, x: number, y: number) => CanvasGradient;
  };
  if (typeof ctx.createConicGradient === "function") {
    const grad = ctx.createConicGradient((g.angle * Math.PI) / 180, w / 2, h / 2);
    for (const s of g.stops) grad.addColorStop(s.offset, s.color);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  } else {
    // fallback: solid of first stop
    ctx.fillStyle = g.stops[0]?.color ?? "#000";
    ctx.fillRect(0, 0, w, h);
  }
  return c;
}

// CSS gradient string for HTML previews (thumbnails, swatches).
export function fillToCss(fill: Fill): string {
  if (fill.kind === "none") return "transparent";
  if (fill.kind === "solid") return fill.color;
  const g = fill.gradient;
  const stops = g.stops.map((s) => `${s.color} ${Math.round(s.offset * 100)}%`).join(", ");
  if (g.type === "radial") return `radial-gradient(circle, ${stops})`;
  if (g.type === "conic") return `conic-gradient(from ${g.angle}deg, ${stops})`;
  return `linear-gradient(${g.angle}deg, ${stops})`;
}
