import type { Layer } from "./types";

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

function overlap(a: Box, b: Box): number {
  const ix = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const iy = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
  if (ix <= 0 || iy <= 0) return 0;
  return ix * iy;
}

// Only editable content zones participate in collision; background art is ignored.
function collidable(l: Layer): boolean {
  return (l.type === "image" || l.type === "logo" || l.type === "text") && l.visible && !l.locked;
}

// Push `moving` out of any colliding sibling along the axis of least penetration.
export function resolveCollision(moving: Layer, all: Layer[]): { x: number; y: number } {
  let { x, y } = moving;
  const box: Box = { x, y, width: moving.width, height: moving.height };
  const siblings = all.filter((l) => l.id !== moving.id && collidable(l));

  for (let iter = 0; iter < 6; iter++) {
    let hit: Layer | null = null;
    for (const s of siblings) {
      if (overlap({ ...box, x, y }, s) > 0) {
        hit = s;
        break;
      }
    }
    if (!hit) break;
    // minimal translation vector
    const acx = x + box.width / 2;
    const acy = y + box.height / 2;
    const bcx = hit.x + hit.width / 2;
    const bcy = hit.y + hit.height / 2;
    const px = (box.width + hit.width) / 2 - Math.abs(acx - bcx);
    const py = (box.height + hit.height) / 2 - Math.abs(acy - bcy);
    if (px < py) {
      x += acx < bcx ? -px : px;
    } else {
      y += acy < bcy ? -py : py;
    }
  }
  return { x, y };
}
