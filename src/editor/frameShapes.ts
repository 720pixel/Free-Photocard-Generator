// Frame clip shapes (Canva-style photo frames). Each shape is described once
// against an abstract "pen" and can be replayed onto a Canvas2D context (for
// the Konva clipFunc) or into an SVG path string (for thumbnails and the
// picker), so the mask, the placeholder and the preview always agree.

interface Pen {
  move(x: number, y: number): void;
  line(x: number, y: number): void;
  curve(cx1: number, cy1: number, cx2: number, cy2: number, x: number, y: number): void;
  close(): void;
}

type ShapeFn = (pen: Pen, w: number, h: number) => void;

function poly(pts: [number, number][]): ShapeFn {
  return (p, w, h) => {
    pts.forEach(([fx, fy], i) => (i === 0 ? p.move(fx * w, fy * h) : p.line(fx * w, fy * h)));
    p.close();
  };
}

// regular n-gon centred, pointing up
function ngon(n: number, rot = -Math.PI / 2): ShapeFn {
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = rot + (i * 2 * Math.PI) / n;
    pts.push([0.5 + 0.5 * Math.cos(a), 0.5 + 0.5 * Math.sin(a)]);
  }
  return poly(pts);
}

function star(spikes = 5, inner = 0.5): ShapeFn {
  const pts: [number, number][] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? 0.5 : 0.5 * inner;
    const a = -Math.PI / 2 + (i * Math.PI) / spikes;
    pts.push([0.5 + r * Math.cos(a), 0.5 + r * Math.sin(a)]);
  }
  return poly(pts);
}

const heart: ShapeFn = (p, w, h) => {
  // classic heart via two bezier lobes, fitted to the box
  const x = (f: number) => f * w;
  const y = (f: number) => f * h;
  p.move(x(0.5), y(0.28));
  p.curve(x(0.5), y(0.1), x(0.1), y(0.0), x(0.1), y(0.32));
  p.curve(x(0.1), y(0.55), x(0.35), y(0.7), x(0.5), y(0.95));
  p.curve(x(0.65), y(0.7), x(0.9), y(0.55), x(0.9), y(0.32));
  p.curve(x(0.9), y(0.0), x(0.5), y(0.1), x(0.5), y(0.28));
  p.close();
};

const blob: ShapeFn = (p, w, h) => {
  const x = (f: number) => f * w;
  const y = (f: number) => f * h;
  p.move(x(0.5), y(0.03));
  p.curve(x(0.78), y(0.05), x(0.97), y(0.2), x(0.95), y(0.45));
  p.curve(x(0.93), y(0.72), x(0.8), y(0.97), x(0.52), y(0.97));
  p.curve(x(0.25), y(0.97), x(0.05), y(0.78), x(0.05), y(0.5));
  p.curve(x(0.05), y(0.22), x(0.22), y(0.02), x(0.5), y(0.03));
  p.close();
};

const arrow: ShapeFn = poly([
  [0, 0.28], [0.6, 0.28], [0.6, 0.08], [1, 0.5], [0.6, 0.92], [0.6, 0.72], [0, 0.72],
]);

// Shapes that need a custom path. rect / rounded / circle stay native.
export const FRAME_SHAPE_FNS: Record<string, ShapeFn> = {
  triangle: poly([[0.5, 0], [1, 1], [0, 1]]),
  diamond: poly([[0.5, 0], [1, 0.5], [0.5, 1], [0, 0.5]]),
  pentagon: ngon(5),
  hexagon: ngon(6),
  star: star(5, 0.46),
  burst: star(12, 0.78),
  heart,
  arrow,
  blob,
  chevron: poly([[0, 0], [0.7, 0], [1, 0.5], [0.7, 1], [0, 1], [0.3, 0.5]]),
};

export function isCustomFrameShape(mask: string): boolean {
  return mask in FRAME_SHAPE_FNS;
}

/** Trace a custom frame shape onto a Canvas2D context (for Konva clipFunc). */
export function drawFrameShape(ctx: CanvasRenderingContext2D, mask: string, w: number, h: number): boolean {
  const fn = FRAME_SHAPE_FNS[mask];
  if (!fn) return false;
  ctx.beginPath();
  const pen: Pen = {
    move: (x, y) => ctx.moveTo(x, y),
    line: (x, y) => ctx.lineTo(x, y),
    curve: (cx1, cy1, cx2, cy2, x, y) => ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x, y),
    close: () => ctx.closePath(),
  };
  fn(pen, w, h);
  return true;
}

/** SVG path `d` for a custom frame shape offset to (x,y). */
export function frameShapePath(mask: string, x: number, y: number, w: number, h: number): string | null {
  const fn = FRAME_SHAPE_FNS[mask];
  if (!fn) return null;
  let d = "";
  const pen: Pen = {
    move: (px, py) => (d += `M ${x + px} ${y + py} `),
    line: (px, py) => (d += `L ${x + px} ${y + py} `),
    curve: (c1x, c1y, c2x, c2y, px, py) => (d += `C ${x + c1x} ${y + c1y} ${x + c2x} ${y + c2y} ${x + px} ${y + py} `),
    close: () => (d += "Z"),
  };
  fn(pen, w, h);
  return d;
}

/** Small filled shape icon (currentColor) for the picker buttons. */
export function frameShapeSvg(id: string): string {
  const inner =
    id === "circle"
      ? `<circle cx="12" cy="12" r="10"/>`
      : id === "rounded"
        ? `<rect x="2" y="2" width="20" height="20" rx="6"/>`
        : id === "rect"
          ? `<rect x="2" y="2" width="20" height="20"/>`
          : `<path d="${frameShapePath(id, 2, 2, 20, 20)}"/>`;
  return `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}

export const FRAME_SHAPES: { id: string; label: string }[] = [
  { id: "rect", label: "Rectangle" },
  { id: "rounded", label: "Rounded" },
  { id: "circle", label: "Circle" },
  { id: "triangle", label: "Triangle" },
  { id: "diamond", label: "Diamond" },
  { id: "pentagon", label: "Pentagon" },
  { id: "hexagon", label: "Hexagon" },
  { id: "star", label: "Star" },
  { id: "burst", label: "Burst" },
  { id: "heart", label: "Heart" },
  { id: "arrow", label: "Arrow" },
  { id: "blob", label: "Blob" },
  { id: "chevron", label: "Chevron" },
];
