import { makeText, makeShape, solid } from "./factories";
import { band, circle, dashedRing } from "./templates/helpers";
import type { Layer } from "./types";

// Signature decoration elements (the "custom options" every template can pull
// in): photo rings, ribbons, live badges, dividers, brackets, etc. Each builder
// returns one or more ready layers positioned for a w×h canvas; the user then
// moves/edits them. Previews are rendered through the normal svgPreview path.

export interface ElementDef {
  id: string;
  label: string;
  build: (w: number, h: number) => Layer[];
}

export const ELEMENTS: ElementDef[] = [
  {
    id: "live",
    label: "Live badge",
    build: (w, h) => {
      const bw = Math.max(150, w * 0.2);
      const bh = Math.max(52, h * 0.05);
      const x = w * 0.06;
      const y = h * 0.06;
      const dotR = bh * 0.16;
      return [
        { ...makeShape({ name: "Live chip", shape: "rounded", x, y, width: bw, height: bh, fill: solid("#e11d2a") }), cornerRadius: bh / 2 },
        circle(x + bh * 0.5, y + bh / 2, dotR, solid("#ffffff"), "Live dot"),
        makeText({ role: "custom", name: "LIVE", text: "LIVE", x: x + bh * 0.75, y: y + bh * 0.18, width: bw - bh, height: bh * 0.7, fontSize: bh * 0.52, fontWeight: 800, fill: "#ffffff", align: "left", letterSpacing: 2, autoFit: false }),
      ];
    },
  },
  {
    id: "ribbon",
    label: "Ribbon",
    build: (w, h) => {
      const bw = w * 0.5;
      const bh = Math.max(60, h * 0.07);
      const x = (w - bw) / 2;
      const y = h * 0.08;
      const notch = bh * 0.55;
      return [
        makeShape({ name: "Ribbon tail L", shape: "triangle", x: x - notch, y: y + bh * 0.1, width: notch, height: bh, fill: solid("#7a0c1f"), rotation: 180 }),
        makeShape({ name: "Ribbon tail R", shape: "triangle", x: x + bw, y: y + bh * 0.1, width: notch, height: bh, fill: solid("#7a0c1f"), rotation: 180 }),
        band(x, y, bw, bh, solid("#b01226"), "Ribbon"),
        makeText({ role: "custom", name: "Ribbon text", text: "শিরোনাম", x, y: y + bh * 0.2, width: bw, height: bh * 0.6, fontSize: bh * 0.5, fontWeight: 700, fill: "#ffffff", align: "center", autoFit: false }),
      ];
    },
  },
  {
    id: "divider",
    label: "Divider",
    build: (w, h) => {
      const y = h * 0.5;
      const lw = w * 0.4;
      const x = (w - lw) / 2;
      const d = Math.max(10, h * 0.012);
      return [
        band(x, y, lw, Math.max(3, h * 0.004), solid("#1c1917"), "Divider line"),
        { ...makeShape({ name: "Divider mark", shape: "rect", x: w / 2 - d / 2, y: y - d / 2 + h * 0.002, width: d, height: d, fill: solid("#1c1917"), rotation: 45 }) },
      ];
    },
  },
  {
    id: "photo-ring",
    label: "Photo ring",
    build: (w, h) => {
      const u = Math.min(w, h);
      return [dashedRing(w * 0.5, h * 0.42, u * 0.28, "#1c1917", [4, 14], "Photo ring")];
    },
  },
  {
    id: "brackets",
    label: "Frame box",
    build: (w, h) => [
      {
        ...makeShape({ name: "Frame box", shape: "rect", x: w * 0.08, y: h * 0.08, width: w * 0.84, height: h * 0.84, fill: { kind: "none" } }),
        stroke: { enabled: true, width: Math.max(3, w * 0.005), color: "#1c1917" },
      },
    ],
  },
  {
    id: "badge",
    label: "Badge",
    build: (w, h) => {
      const u = Math.min(w, h);
      const r = u * 0.12;
      const cx = w * 0.8;
      const cy = h * 0.12;
      return [
        circle(cx, cy, r, solid("#c8102e"), "Badge disc"),
        makeText({ role: "custom", name: "Badge text", text: "নতুন", x: cx - r, y: cy - r * 0.4, width: r * 2, height: r * 0.8, fontSize: r * 0.5, fontWeight: 800, fill: "#ffffff", align: "center", autoFit: false }),
      ];
    },
  },
  {
    id: "quote",
    label: "Quote marks",
    build: (w, h) =>
      [makeText({ role: "custom", name: "Quote", text: "“", x: w * 0.06, y: h * 0.04, width: w * 0.3, height: h * 0.3, fontSize: Math.min(w, h) * 0.4, fontWeight: 800, fill: "#1c1917", align: "left", autoFit: false })],
  },
  {
    id: "tag",
    label: "Tag chip",
    build: (w, h) => {
      const bw = w * 0.26;
      const bh = Math.max(50, h * 0.05);
      const x = w * 0.06;
      const y = h * 0.86;
      return [
        { ...makeShape({ name: "Tag", shape: "rounded", x, y, width: bw, height: bh, fill: solid("#1c1917") }), cornerRadius: 8 },
        makeText({ role: "custom", name: "Tag text", text: "বিভাগ", x, y: y + bh * 0.2, width: bw, height: bh * 0.6, fontSize: bh * 0.42, fontWeight: 700, fill: "#ffffff", align: "center", autoFit: false }),
      ];
    },
  },
  {
    id: "dots",
    label: "Dot row",
    build: (w, h) => {
      const r = Math.max(6, w * 0.01);
      const gap = r * 4;
      const y = h * 0.5;
      const startX = w * 0.5 - gap * 2;
      const out: Layer[] = [];
      for (let i = 0; i < 5; i++) out.push(circle(startX + i * gap, y, r, solid("#1c1917"), `Dot ${i + 1}`));
      return out;
    },
  },
  {
    id: "underline",
    label: "Highlight",
    build: (w, h) => [band(w * 0.1, h * 0.6, w * 0.35, Math.max(14, h * 0.02), solid("#f2b705"), "Highlight")],
  },
  {
    id: "ticker",
    label: "News ticker",
    build: (w, h) => {
      const bh = Math.max(56, h * 0.055);
      const y = h * 0.88;
      const tab = w * 0.16;
      return [
        band(0, y, w, bh, solid("#141414"), "Ticker bar"),
        band(0, y, tab, bh, solid("#e11d2a"), "Ticker tab"),
        makeText({ role: "custom", name: "Ticker label", text: "খবর", x: 0, y: y + bh * 0.22, width: tab, height: bh * 0.6, fontSize: bh * 0.42, fontWeight: 800, fill: "#ffffff", align: "center", autoFit: false }),
        makeText({ role: "custom", name: "Ticker text", text: "সর্বশেষ সংবাদ এখানে", x: tab + w * 0.02, y: y + bh * 0.24, width: w - tab - w * 0.04, height: bh * 0.55, fontSize: bh * 0.4, fontWeight: 600, fill: "#ffffff", align: "left", autoFit: false }),
      ];
    },
  },
  {
    id: "ornament",
    label: "Ornament",
    build: (w, h) => {
      const cx = w * 0.5;
      const y = h * 0.16;
      const u = Math.min(w, h);
      const r = u * 0.012;
      return [
        band(cx - w * 0.18, y, w * 0.36, Math.max(2, h * 0.003), solid("#b0894f"), "Ornament rule"),
        { ...makeShape({ name: "Ornament gem", shape: "rect", x: cx - r, y: y - r + h * 0.0015, width: r * 2, height: r * 2, fill: solid("#b0894f"), rotation: 45 }) },
        circle(cx - w * 0.2, y + h * 0.0015, r * 0.8, solid("#b0894f"), "Ornament dot L"),
        circle(cx + w * 0.2, y + h * 0.0015, r * 0.8, solid("#b0894f"), "Ornament dot R"),
      ];
    },
  },
];

export function elementById(id: string): ElementDef | undefined {
  return ELEMENTS.find((e) => e.id === id);
}

// Per-category signature element sets. A template with no explicit `elements`
// falls back to its category's set, so every template surfaces a relevant,
// varied add-on shortlist (with previews) in the editor.
const CATEGORY_ELEMENTS: Record<string, string[]> = {
  "Breaking News": ["live", "ticker", "ribbon", "divider"],
  "TV Channel": ["live", "ticker", "badge", "brackets"],
  Newspaper: ["divider", "brackets", "quote", "ornament"],
  Sports: ["badge", "dots", "underline", "ribbon"],
  Entertainment: ["badge", "quote", "dots", "underline"],
  Religious: ["ornament", "photo-ring", "divider", "quote"],
  Tribute: ["photo-ring", "ornament", "divider", "quote"],
  Notice: ["brackets", "divider", "tag", "ribbon"],
  Quote: ["quote", "divider", "underline", "ornament"],
  Weather: ["badge", "dots", "divider", "tag"],
  Abstract: ["photo-ring", "dots", "underline", "brackets"],
  Collage: ["divider", "tag", "ribbon", "badge"],
  General: ["divider", "tag", "badge", "underline"],
};

const FALLBACK_ELEMENTS = ["live", "ribbon", "divider", "photo-ring"];

export function signatureElements(category: string, explicit?: string[]): ElementDef[] {
  const ids = explicit?.length ? explicit : CATEGORY_ELEMENTS[category] ?? FALLBACK_ELEMENTS;
  return ids.map((id) => elementById(id)).filter((e): e is ElementDef => !!e);
}
