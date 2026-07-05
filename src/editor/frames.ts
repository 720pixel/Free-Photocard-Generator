import type { FrameSpec } from "./types";

// Decorative image frames. Each entry knows its sensible defaults and can draw
// a small self-contained SVG preview for the picker. The live Konva rendering
// lives in render/nodes.tsx (frameNodes) and mirrors these looks.

export interface FrameDef {
  id: string;
  label: string;
  defaults?: Partial<Pick<FrameSpec, "width" | "color" | "color2">>;
  /** Small preview over a demo photo rect, viewBox 0 0 100 100. */
  preview: (c: string, c2: string) => string;
}

const photo = `<defs><linearGradient id="fp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cdb9a3"/><stop offset="1" stop-color="#8a6f57"/></linearGradient></defs><rect x="12" y="12" width="76" height="76" fill="url(#fp)"/>`;

export const FRAMES: FrameDef[] = [
  { id: "none", label: "None", preview: () => `<rect x="12" y="12" width="76" height="76" fill="url(#fp)"/><defs><linearGradient id="fp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cdb9a3"/><stop offset="1" stop-color="#8a6f57"/></linearGradient></defs>` },
  {
    id: "line",
    label: "Line",
    defaults: { width: 10, color: "#1c1917" },
    preview: (c) => `${photo}<rect x="12" y="12" width="76" height="76" fill="none" stroke="${c}" stroke-width="6"/>`,
  },
  {
    id: "double",
    label: "Double",
    defaults: { width: 8, color: "#1c1917" },
    preview: (c) => `${photo}<rect x="12" y="12" width="76" height="76" fill="none" stroke="${c}" stroke-width="5"/><rect x="22" y="22" width="56" height="56" fill="none" stroke="${c}" stroke-width="2"/>`,
  },
  {
    id: "inset",
    label: "Mat",
    defaults: { width: 16, color: "#ffffff", color2: "#1c1917" },
    preview: (c, c2) => `<rect x="12" y="12" width="76" height="76" fill="${c}"/><rect x="24" y="24" width="52" height="52" fill="url(#fp)"/><defs><linearGradient id="fp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cdb9a3"/><stop offset="1" stop-color="#8a6f57"/></linearGradient></defs><rect x="24" y="24" width="52" height="52" fill="none" stroke="${c2}" stroke-width="1.5"/>`,
  },
  {
    id: "polaroid",
    label: "Polaroid",
    defaults: { width: 12, color: "#ffffff" },
    preview: (c) => `<rect x="12" y="10" width="76" height="82" fill="${c}"/><rect x="20" y="18" width="60" height="52" fill="url(#fp)"/><defs><linearGradient id="fp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cdb9a3"/><stop offset="1" stop-color="#8a6f57"/></linearGradient></defs>`,
  },
  {
    id: "film",
    label: "Film",
    defaults: { width: 12, color: "#141414", color2: "#f5f5f5" },
    preview: (c, c2) => {
      let holes = "";
      for (let i = 0; i < 5; i++) { holes += `<rect x="${16 + i * 14}" y="14" width="6" height="4" fill="${c2}"/><rect x="${16 + i * 14}" y="82" width="6" height="4" fill="${c2}"/>`; }
      return `<rect x="10" y="10" width="80" height="80" fill="${c}"/><rect x="20" y="24" width="60" height="52" fill="url(#fp)"/><defs><linearGradient id="fp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cdb9a3"/><stop offset="1" stop-color="#8a6f57"/></linearGradient></defs>${holes}`;
    },
  },
  {
    id: "tape",
    label: "Tape",
    defaults: { width: 6, color: "#e9d8a6" },
    preview: (c) => `${photo}<g fill="${c}" opacity="0.85"><rect x="4" y="8" width="26" height="12" transform="rotate(-25 17 14)"/><rect x="70" y="80" width="26" height="12" transform="rotate(-25 83 86)"/></g>`,
  },
  {
    id: "dashed",
    label: "Dashed",
    defaults: { width: 6, color: "#1c1917" },
    preview: (c) => `${photo}<rect x="12" y="12" width="76" height="76" fill="none" stroke="${c}" stroke-width="4" stroke-dasharray="8,6"/>`,
  },
  {
    id: "dotted",
    label: "Dotted",
    defaults: { width: 6, color: "#1c1917" },
    preview: (c) => `${photo}<rect x="12" y="12" width="76" height="76" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round" stroke-dasharray="0.5,8"/>`,
  },
  {
    id: "corners",
    label: "Corners",
    defaults: { width: 8, color: "#1c1917" },
    preview: (c) => `${photo}<g fill="none" stroke="${c}" stroke-width="5"><path d="M12 30 V12 H30"/><path d="M70 12 H88 V30"/><path d="M88 70 V88 H70"/><path d="M30 88 H12 V70"/></g>`,
  },
  {
    id: "shadowbox",
    label: "Shadow box",
    defaults: { width: 8, color: "#1c1917", color2: "#c06a3f" },
    preview: (c, c2) => `<rect x="20" y="20" width="72" height="72" fill="${c2}"/>${photo}<rect x="12" y="12" width="76" height="76" fill="none" stroke="${c}" stroke-width="4"/>`,
  },
  {
    id: "ticket",
    label: "Ticket",
    defaults: { width: 8, color: "#1c1917", color2: "#f3ede1" },
    preview: (c, c2) => `${photo}<rect x="12" y="12" width="76" height="76" fill="none" stroke="${c}" stroke-width="4"/><circle cx="12" cy="50" r="7" fill="${c2}" stroke="${c}" stroke-width="2"/><circle cx="88" cy="50" r="7" fill="${c2}" stroke="${c}" stroke-width="2"/>`,
  },
  {
    id: "stack",
    label: "Stacked blur",
    defaults: { width: 14, color: "#ffffff" },
    preview: (c) =>
      `<defs><linearGradient id="fp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cdb9a3"/><stop offset="1" stop-color="#8a6f57"/></linearGradient><filter id="fb"><feGaussianBlur stdDeviation="4"/></filter></defs>` +
      `<rect x="18" y="18" width="70" height="70" fill="url(#fp)" filter="url(#fb)" opacity="0.9" transform="rotate(6 53 53)"/>` +
      `<rect x="10" y="12" width="66" height="66" fill="url(#fp)" stroke="${c}" stroke-width="5"/>`,
  },
];

export const DEFAULT_FRAME: FrameSpec = { style: "line", color: "#1c1917", color2: "#ffffff", width: 10 };

export function frameById(id: string): FrameDef {
  return FRAMES.find((f) => f.id === id) ?? FRAMES[0];
}

export function makeFrameSpec(id: string): FrameSpec {
  const def = frameById(id);
  return { ...DEFAULT_FRAME, style: id, ...def.defaults };
}

export function framePreviewSvg(id: string, c: string, c2: string): string {
  const def = frameById(id);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">${def.preview(c, c2)}</svg>`;
}
