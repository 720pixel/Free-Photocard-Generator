import { makeShape } from "../factories";
import type { Fill, ShapeLayer } from "../types";

// Deterministic pseudo-random for stable torn edges.
function seeded(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

// Build a jagged horizontal torn edge across width w at baseline y.
// fillSide 'below' fills the area under the jag; 'above' fills above it.
export function tornBandPath(
  w: number,
  h: number,
  y: number,
  amplitude: number,
  segments: number,
  fillSide: "above" | "below",
  seed = 7,
): string {
  const rnd = seeded(seed);
  const step = w / segments;
  const pts: [number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const jitter = (rnd() - 0.5) * 2 * amplitude;
    pts.push([i * step, y + jitter]);
  }
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const mx = (x0 + x1) / 2;
    d += ` Q ${x0} ${y0} ${mx} ${(y0 + y1) / 2}`;
    d += ` T ${x1} ${y1}`;
  }
  if (fillSide === "below") d += ` L ${w} ${h} L 0 ${h} Z`;
  else d += ` L ${w} 0 L 0 0 Z`;
  return d;
}

export function tornBand(
  w: number,
  h: number,
  y: number,
  fill: Fill,
  opts: { amplitude?: number; segments?: number; side?: "above" | "below"; seed?: number; name?: string } = {},
): ShapeLayer {
  const { amplitude = h * 0.012, segments = 22, side = "below", seed = 7, name = "Torn band" } = opts;
  return makeShape({
    name,
    shape: "path",
    x: 0,
    y: 0,
    width: w,
    height: h,
    fill,
    pathData: tornBandPath(w, h, y, amplitude, segments, side, seed),
  });
}

export function band(x: number, y: number, w: number, h: number, fill: Fill, name = "Band"): ShapeLayer {
  return makeShape({ name, shape: "rect", x, y, width: w, height: h, fill });
}

export function circle(cx: number, cy: number, r: number, fill: Fill, name = "Circle"): ShapeLayer {
  return makeShape({ name, shape: "circle", x: cx - r, y: cy - r, width: r * 2, height: r * 2, fill });
}

export function dashedRing(
  cx: number,
  cy: number,
  r: number,
  color: string,
  dash: number[] = [12, 10],
  name = "Dashed ring",
): ShapeLayer {
  return makeShape({
    name,
    shape: "circle",
    x: cx - r,
    y: cy - r,
    width: r * 2,
    height: r * 2,
    fill: { kind: "none" },
    stroke: { enabled: true, width: 3, color },
    dash,
  });
}

export function slantBand(
  x: number,
  y: number,
  w: number,
  h: number,
  fill: Fill,
  rotation: number,
  name = "Slant band",
): ShapeLayer {
  return makeShape({ name, shape: "rect", x, y, width: w, height: h, fill, rotation });
}
