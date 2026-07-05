import type { TextureSpec } from "./types";

// Minimalistic, seamless, tileable textures. Each generator returns the inner
// markup of one tile of size s×s; the pattern repeats that tile. Everything is
// parametric (color, weight, tile size) so the same catalog covers dots that
// are tight or loose, hairlines or bold rules, etc.

export interface TextureDef {
  id: string;
  label: string;
  /** Inner SVG markup for one s×s tile. `c` = color, `w` = strokeWidth. */
  tile: (s: number, c: string, w: number) => string;
  /** Sensible default tile size + weight for a fresh instance. */
  defaults?: Partial<Pick<TextureSpec, "scale" | "strokeWidth">>;
  /**
   * Cover textures span the whole area (halftone fades, grunge clouds) instead
   * of repeating a tile. When present the renderer stretches one full-size SVG
   * across the layer rather than tiling.
   */
  full?: (spec: TextureSpec, w: number, h: number) => string;
}

// deterministic PRNG so grunge/grain never flicker between renders
function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

const line = (x1: number, y1: number, x2: number, y2: number, c: string, w: number) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="square"/>`;

export const TEXTURES: TextureDef[] = [
  {
    id: "dots",
    label: "Dots",
    defaults: { scale: 28, strokeWidth: 2.4 },
    tile: (s, c, w) => `<circle cx="${s / 2}" cy="${s / 2}" r="${w}" fill="${c}"/>`,
  },
  {
    id: "dots-dense",
    label: "Fine dots",
    defaults: { scale: 14, strokeWidth: 1.4 },
    tile: (s, c, w) => `<circle cx="${s / 2}" cy="${s / 2}" r="${w}" fill="${c}"/>`,
  },
  {
    id: "grid",
    label: "Grid",
    defaults: { scale: 32, strokeWidth: 1 },
    tile: (s, c, w) => line(0, 0, s, 0, c, w) + line(0, 0, 0, s, c, w),
  },
  {
    id: "lines-h",
    label: "Rules",
    defaults: { scale: 18, strokeWidth: 1.5 },
    tile: (s, c, w) => line(0, s / 2, s, s / 2, c, w),
  },
  {
    id: "lines-v",
    label: "Columns",
    defaults: { scale: 18, strokeWidth: 1.5 },
    tile: (s, c, w) => line(s / 2, 0, s / 2, s, c, w),
  },
  {
    id: "diagonal",
    label: "Diagonal",
    defaults: { scale: 20, strokeWidth: 2 },
    // two offset diagonals make the tile seamless across edges
    tile: (s, c, w) => line(0, s, s, 0, c, w) + line(-1, 1, 1, -1, c, w) + line(s - 1, s + 1, s + 1, s - 1, c, w),
  },
  {
    id: "crosshatch",
    label: "Crosshatch",
    defaults: { scale: 22, strokeWidth: 1.2 },
    tile: (s, c, w) =>
      line(0, s, s, 0, c, w) + line(0, 0, s, s, c, w) + line(-1, 1, 1, -1, c, w) + line(s - 1, s + 1, s + 1, s - 1, c, w),
  },
  {
    id: "plus",
    label: "Plus",
    defaults: { scale: 26, strokeWidth: 1.6 },
    tile: (s, c, w) => {
      const m = s / 2;
      const r = s * 0.18;
      return line(m - r, m, m + r, m, c, w) + line(m, m - r, m, m + r, c, w);
    },
  },
  {
    id: "cross",
    label: "Ticks",
    defaults: { scale: 24, strokeWidth: 1.4 },
    tile: (s, c, w) => {
      const r = s * 0.14;
      return line(0, 0, r, 0, c, w) + line(0, 0, 0, r, c, w) + line(s, s, s - r, s, c, w) + line(s, s, s, s - r, c, w);
    },
  },
  {
    id: "rings",
    label: "Rings",
    defaults: { scale: 34, strokeWidth: 1.3 },
    tile: (s, c, w) => `<circle cx="${s / 2}" cy="${s / 2}" r="${s * 0.32}" fill="none" stroke="${c}" stroke-width="${w}"/>`,
  },
  {
    id: "triangles",
    label: "Triangles",
    defaults: { scale: 26, strokeWidth: 1.2 },
    tile: (s, c, w) =>
      `<path d="M0 ${s} L${s / 2} 0 L${s} ${s} Z" fill="none" stroke="${c}" stroke-width="${w}"/>`,
  },
  {
    id: "chevron",
    label: "Chevron",
    defaults: { scale: 22, strokeWidth: 1.6 },
    tile: (s, c, w) => line(0, s, s / 2, 0, c, w) + line(s / 2, 0, s, s, c, w),
  },
  {
    id: "waves",
    label: "Waves",
    defaults: { scale: 28, strokeWidth: 1.5 },
    tile: (s, c, w) =>
      `<path d="M0 ${s / 2} Q ${s / 4} 0 ${s / 2} ${s / 2} T ${s} ${s / 2}" fill="none" stroke="${c}" stroke-width="${w}"/>`,
  },
  {
    id: "carbon",
    label: "Weave",
    defaults: { scale: 16, strokeWidth: 3 },
    tile: (s, c) => {
      const h = s / 2;
      return (
        `<rect x="0" y="0" width="${h}" height="${h}" fill="${c}" opacity="0.9"/>` +
        `<rect x="${h}" y="${h}" width="${h}" height="${h}" fill="${c}" opacity="0.9"/>`
      );
    },
  },
  {
    id: "confetti",
    label: "Confetti",
    defaults: { scale: 30, strokeWidth: 3 },
    tile: (s, c, w) => {
      // deterministic scattered dashes
      const marks = [
        [0.2, 0.25, 20],
        [0.7, 0.4, -35],
        [0.45, 0.8, 15],
        [0.85, 0.75, 60],
      ];
      return marks
        .map(([fx, fy, rot]) => {
          const x = fx * s;
          const y = fy * s;
          const len = s * 0.16;
          return `<line x1="${x - len}" y1="${y}" x2="${x + len}" y2="${y}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" transform="rotate(${rot} ${x} ${y})"/>`;
        })
        .join("");
    },
  },
  {
    id: "paper",
    label: "Paper",
    defaults: { scale: 40, strokeWidth: 1 },
    tile: (s, c) => {
      // subtle speckle: many tiny deterministic dots
      let out = "";
      const rnd = rng(91);
      for (let i = 0; i < 26; i++) {
        out += `<circle cx="${(rnd() * s).toFixed(1)}" cy="${(rnd() * s).toFixed(1)}" r="${(0.4 + rnd() * 0.7).toFixed(2)}" fill="${c}"/>`;
      }
      return out;
    },
  },
  {
    id: "brick",
    label: "Brick",
    defaults: { scale: 46, strokeWidth: 2 },
    tile: (s, c, w) => {
      const bh = s / 2;
      return (
        `<g fill="none" stroke="${c}" stroke-width="${w}">` +
        `<line x1="0" y1="0" x2="${s}" y2="0"/>` +
        `<line x1="0" y1="${bh}" x2="${s}" y2="${bh}"/>` +
        `<line x1="${s / 2}" y1="0" x2="${s / 2}" y2="${bh}"/>` +
        `<line x1="0" y1="${bh}" x2="0" y2="${s}"/>` +
        `<line x1="${s}" y1="${bh}" x2="${s}" y2="${s}"/>` +
        `</g>`
      );
    },
  },
  {
    id: "weave",
    label: "Linen",
    defaults: { scale: 18, strokeWidth: 1 },
    tile: (s, c, w) => {
      const h = s / 2;
      return (
        `<g stroke="${c}" stroke-width="${w}" opacity="0.9">` +
        `<line x1="0" y1="${h / 2}" x2="${h}" y2="${h / 2}"/>` +
        `<line x1="${h}" y1="${h + h / 2}" x2="${s}" y2="${h + h / 2}"/>` +
        `<line x1="${h / 2}" y1="${h}" x2="${h / 2}" y2="${s}"/>` +
        `<line x1="${h + h / 2}" y1="0" x2="${h + h / 2}" y2="${h}"/>` +
        `</g>`
      );
    },
  },
  {
    id: "zigzag",
    label: "Zigzag",
    defaults: { scale: 24, strokeWidth: 1.6 },
    tile: (s, c, w) => `<polyline points="0,${s * 0.75} ${s * 0.25},${s * 0.25} ${s * 0.5},${s * 0.75} ${s * 0.75},${s * 0.25} ${s},${s * 0.75}" fill="none" stroke="${c}" stroke-width="${w}"/>`,
  },
  {
    id: "scales",
    label: "Scales",
    defaults: { scale: 26, strokeWidth: 1.3 },
    tile: (s, c, w) =>
      `<g fill="none" stroke="${c}" stroke-width="${w}"><path d="M0 ${s * 0.5} A ${s * 0.5} ${s * 0.5} 0 0 1 ${s} ${s * 0.5}"/><path d="M${-s * 0.5} ${s} A ${s * 0.5} ${s * 0.5} 0 0 1 ${s * 0.5} ${s}"/><path d="M${s * 0.5} ${s} A ${s * 0.5} ${s * 0.5} 0 0 1 ${s * 1.5} ${s}"/></g>`,
  },
  {
    id: "noise",
    label: "Grain",
    defaults: { scale: 60, strokeWidth: 1 },
    tile: (s, c) => {
      let out = "";
      const rnd = rng(1337);
      for (let i = 0; i < 90; i++) {
        out += `<rect x="${(rnd() * s).toFixed(1)}" y="${(rnd() * s).toFixed(1)}" width="1" height="1" fill="${c}" opacity="${(0.3 + rnd() * 0.6).toFixed(2)}"/>`;
      }
      return out;
    },
  },
  // ---- Cover textures (span the whole area) --------------------------------
  {
    id: "halftone-fade",
    label: "Halftone fade",
    defaults: { scale: 22, strokeWidth: 1 },
    tile: (s, c) => `<circle cx="${s / 2}" cy="${s / 2}" r="${s * 0.18}" fill="${c}"/>`,
    full: (spec, w, h) => {
      const step = Math.max(8, spec.scale);
      const maxR = step * 0.48;
      let out = "";
      for (let y = step / 2; y < h; y += step) {
        const t = y / h; // grow downward -> fades into the background at the top
        for (let x = step / 2; x < w; x += step) {
          const r = maxR * t;
          if (r > 0.4) out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="${spec.color}"/>`;
        }
      }
      return out;
    },
  },
  {
    id: "halftone-radial",
    label: "Halftone glow",
    defaults: { scale: 22, strokeWidth: 1 },
    tile: (s, c) => `<circle cx="${s / 2}" cy="${s / 2}" r="${s * 0.18}" fill="${c}"/>`,
    full: (spec, w, h) => {
      const step = Math.max(8, spec.scale);
      const maxR = step * 0.5;
      const cx = w / 2;
      const cy = h / 2;
      const maxD = Math.hypot(cx, cy);
      let out = "";
      for (let y = step / 2; y < h; y += step) {
        for (let x = step / 2; x < w; x += step) {
          const d = Math.hypot(x - cx, y - cy) / maxD; // bigger toward edges
          const r = maxR * d;
          if (r > 0.4) out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="${spec.color}"/>`;
        }
      }
      return out;
    },
  },
  {
    id: "grunge",
    label: "Grunge",
    defaults: { scale: 40, strokeWidth: 1 },
    tile: (s, c) => `<circle cx="${s / 2}" cy="${s / 2}" r="1" fill="${c}"/>`,
    full: (spec, w, h) => {
      const rnd = rng(7);
      const n = Math.round((w * h) / 900);
      let out = "";
      for (let i = 0; i < n; i++) {
        const r = 0.4 + rnd() * 2.2;
        out += `<circle cx="${(rnd() * w).toFixed(1)}" cy="${(rnd() * h).toFixed(1)}" r="${r.toFixed(2)}" fill="${spec.color}" opacity="${(0.15 + rnd() * 0.5).toFixed(2)}"/>`;
      }
      return out;
    },
  },
];

export const DEFAULT_TEXTURE: TextureSpec = {
  kind: "dots",
  color: "#111111",
  background: "transparent",
  scale: 28,
  strokeWidth: 2.4,
  opacity: 0.5,
};

export function textureById(id: string): TextureDef {
  return TEXTURES.find((t) => t.id === id) ?? TEXTURES[0];
}

/** A full <svg> string for one repeating tile of the given texture. */
export function textureSvg(spec: TextureSpec): string {
  const def = textureById(spec.kind);
  const s = Math.max(4, spec.scale);
  const bg = spec.background && spec.background !== "transparent" ? `<rect width="${s}" height="${s}" fill="${spec.background}"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}"><g opacity="${spec.opacity}">${bg}${def.tile(s, spec.color, spec.strokeWidth)}</g></svg>`;
}

export function textureDataUrl(spec: TextureSpec): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(textureSvg(spec))}`;
}

export function textureIsCover(kind: string): boolean {
  return !!textureById(kind).full;
}

/** Full-area SVG for a cover texture (halftone fades, grunge) at a given size. */
export function textureFullSvg(spec: TextureSpec, w: number, h: number): string {
  const def = textureById(spec.kind);
  const inner = def.full ? def.full(spec, w, h) : def.tile(Math.max(4, spec.scale), spec.color, spec.strokeWidth);
  const bg = spec.background && spec.background !== "transparent" ? `<rect width="${w}" height="${h}" fill="${spec.background}"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><g opacity="${spec.opacity}">${bg}${inner}</g></svg>`;
}

export function textureFullDataUrl(spec: TextureSpec, w: number, h: number): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(textureFullSvg(spec, w, h))}`;
}
