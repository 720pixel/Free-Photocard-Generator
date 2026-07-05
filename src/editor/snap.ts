import type { Layer } from "./types";

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SnapResult {
  x: number;
  y: number;
  vLines: number[]; // canvas x positions to draw vertical guides
  hLines: number[]; // canvas y positions to draw horizontal guides
}

// Collect alignment targets from the canvas and sibling layers.
function targets(all: Layer[], excludeId: string, canvasW: number, canvasH: number) {
  const v = [0, canvasW / 2, canvasW]; // vertical guides at these x
  const h = [0, canvasH / 2, canvasH];
  for (const l of all) {
    if (l.id === excludeId || !l.visible) continue;
    v.push(l.x, l.x + l.width / 2, l.x + l.width);
    h.push(l.y, l.y + l.height / 2, l.y + l.height);
  }
  return { v, h };
}

// Given the moving box, snap its edges/center to the nearest target within threshold.
export function computeSnap(
  box: Box,
  all: Layer[],
  excludeId: string,
  canvasW: number,
  canvasH: number,
  threshold: number,
): SnapResult {
  const { v, h } = targets(all, excludeId, canvasW, canvasH);
  let { x, y } = box;
  const vLines: number[] = [];
  const hLines: number[] = [];

  // candidate anchor offsets relative to box origin
  const xAnchors = [0, box.width / 2, box.width];
  const yAnchors = [0, box.height / 2, box.height];

  let bestX: { dist: number; nx: number; line: number } | null = null;
  for (const off of xAnchors) {
    const cand = box.x + off;
    for (const t of v) {
      const d = Math.abs(cand - t);
      if (d <= threshold && (!bestX || d < bestX.dist)) {
        bestX = { dist: d, nx: t - off, line: t };
      }
    }
  }
  if (bestX) {
    x = bestX.nx;
    vLines.push(bestX.line);
  }

  let bestY: { dist: number; ny: number; line: number } | null = null;
  for (const off of yAnchors) {
    const cand = box.y + off;
    for (const t of h) {
      const d = Math.abs(cand - t);
      if (d <= threshold && (!bestY || d < bestY.dist)) {
        bestY = { dist: d, ny: t - off, line: t };
      }
    }
  }
  if (bestY) {
    y = bestY.ny;
    hLines.push(bestY.line);
  }

  return { x, y, vLines, hLines };
}
