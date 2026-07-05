import { makeHeading, makeImage, makeLogo, makeShape, makeText, solid, linear } from "../factories";
import { band, circle, dashedRing, slantBand } from "./helpers";
import type { Fill } from "../types";
import type { TemplateDef } from "./types";

// ---- local fill helpers ----------------------------------------------------
function radial(stops: { color: string; offset: number }[]): Fill {
  return { kind: "gradient", gradient: { type: "radial", angle: 0, stops } };
}

// small site/handle chip, kept optional + minimal
function handle(text: string, x: number, y: number, w: number, color: string, align: "left" | "center" | "right" = "center") {
  return makeText({
    role: "site",
    name: "Handle",
    text,
    x,
    y,
    width: w,
    height: 46,
    fontSize: 26,
    fontWeight: 600,
    fill: color,
    align,
    letterSpacing: 2,
  });
}

// 1. Hex Right — diamond-framed circular photo, right-center ------------------
const hexRight: TemplateDef = {
  id: "abstract-hex-right",
  name: "Hex Right",
  nameBn: "হেক্স রাইট",
  category: "Abstract",
  palette: { primary: "#f5f0e6", secondary: "#b5654a", accent: "#b5654a", text: "#1c1917", textAlt: "#b5654a" },
  tags: ["diamond", "hex", "geometric", "right"],
  build: (w, h) => {
    const u = Math.min(w, h);
    const cx = w * 0.74;
    const cy = h * 0.5;
    const r = u * 0.22;
    const side = r * 2 * 1.2;
    return {
      background: solid("#f5f0e6"),
      layers: [
        dashedRing(cx, cy, r * 1.3, "#b5654a", [3, 12], "Outer ring"),
        {
          ...makeShape({ name: "Diamond frame", shape: "rect", x: cx - side / 2, y: cy - side / 2, width: side, height: side, fill: solid("#b5654a"), rotation: 45 }),
          shadow: { enabled: true, x: 0, y: 10, blur: 24, color: "#1c1917", opacity: 0.2 },
        },
        {
          ...makeImage({ x: cx - r, y: cy - r, width: r * 2, height: r * 2, mask: "circle", cornerRadius: 0 }),
          stroke: { enabled: true, width: 5, color: "#f5f0e6" },
        },
        circle(w * 0.15, h * 0.86, u * 0.035, solid("#b5654a"), "Deco dot"),
        makeLogo({ x: w * 0.06, y: h * 0.06, width: 78, height: 78, mask: "circle" }),
        {
          ...makeHeading("ষড়ভুজের আলো", { x: w * 0.06, y: h * 0.38, width: w * 0.42, height: h * 0.24, fill: "#1c1917", fontSize: 66, align: "left" }),
          letterSpacing: -1,
        },
        handle("@yourpage", w * 0.06, h * 0.86, w * 0.36, "#b5654a", "left"),
      ],
    };
  },
};

// 2. Center Column — narrow tall photo strip down the middle -----------------
const centerColumn: TemplateDef = {
  id: "abstract-center-column",
  name: "Center Column",
  nameBn: "সেন্টার কলাম",
  category: "Abstract",
  palette: { primary: "#faf7f0", secondary: "#6b705c", accent: "#6b705c", text: "#1c1917", textAlt: "#6b705c" },
  tags: ["column", "strip", "vertical", "symmetry"],
  build: (w, h) => {
    const rw = Math.max(4, w * 0.006);
    return {
      background: solid("#faf7f0"),
      layers: [
        band(0, 0, w * 0.4, h, solid("#f0ebdf"), "Left field"),
        band(w * 0.6, 0, w * 0.4, h, solid("#f0ebdf"), "Right field"),
        band(w * 0.4 - rw, 0, rw, h, solid("#6b705c"), "Left rule"),
        band(w * 0.6, 0, rw, h, solid("#6b705c"), "Right rule"),
        makeImage({ x: w * 0.4, y: 0, width: w * 0.2, height: h, mask: "rect", cornerRadius: 0 }),
        makeLogo({ x: w * 0.5 - 36, y: h * 0.05, width: 72, height: 72, mask: "circle" }),
        makeHeading("মাঝের কলাম", { x: w * 0.02, y: h * 0.82, width: w * 0.96, height: h * 0.12, fill: "#1c1917", fontSize: 58, align: "center" }),
        handle("@yourpage", w * 0.02, h * 0.93, w * 0.96, "#6b705c", "center"),
      ],
    };
  },
};

// 3. Pill Upper — photo in a wide rounded pill, upper-center ------------------
const pillUpper: TemplateDef = {
  id: "abstract-pill-upper",
  name: "Pill Upper",
  nameBn: "পিল আপার",
  category: "Abstract",
  palette: { primary: "#ede6d6", secondary: "#bc6c25", accent: "#bc6c25", text: "#2b2621", textAlt: "#bc6c25" },
  tags: ["pill", "playful", "rounded", "upper"],
  build: (w, h) => {
    const u = Math.min(w, h);
    const pw = w * 0.74;
    const ph = h * 0.26;
    const px = w * 0.13;
    const py = h * 0.08;
    const pad = ph * 0.06;
    const dots = [
      circle(w * 0.1, h * 0.66, u * 0.02, solid("#bc6c25"), "Dot 1"),
      circle(w * 0.18, h * 0.72, u * 0.028, solid("#bc6c25"), "Dot 2"),
      circle(w * 0.86, h * 0.68, u * 0.024, solid("#bc6c25"), "Dot 3"),
      circle(w * 0.9, h * 0.78, u * 0.016, solid("#bc6c25"), "Dot 4"),
      circle(w * 0.08, h * 0.8, u * 0.014, solid("#bc6c25"), "Dot 5"),
    ];
    return {
      background: solid("#ede6d6"),
      layers: [
        { ...makeShape({ name: "Pill frame", shape: "rounded", x: px, y: py, width: pw, height: ph, fill: solid("#bc6c25") }), cornerRadius: ph * 0.5 },
        makeImage({ x: px + pad, y: py + pad, width: pw - pad * 2, height: ph - pad * 2, mask: "rounded", cornerRadius: (ph - pad * 2) * 0.5 }),
        ...dots,
        makeLogo({ x: w * 0.06, y: h * 0.04, width: 64, height: 64, mask: "circle" }),
        makeHeading("উষ্ণ আনন্দ", { x: w * 0.1, y: h * 0.42, width: w * 0.8, height: h * 0.2, fill: "#2b2621", fontSize: 68, align: "center" }),
        handle("@yourpage", w * 0.1, h * 0.9, w * 0.8, "#bc6c25", "center"),
      ],
    };
  },
};

// 4. Diagonal Split — beige field cut by a muted diagonal, photo lower-left ---
const diagonalSplit: TemplateDef = {
  id: "abstract-diagonal-split",
  name: "Diagonal Split",
  nameBn: "ডায়াগোনাল স্প্লিট",
  category: "Abstract",
  palette: { primary: "#f3ede1", secondary: "#5b6057", accent: "#5b6057", text: "#1c1917", textAlt: "#5b6057" },
  tags: ["diagonal", "split", "duotone", "bold"],
  build: (w, h) => {
    const u = Math.min(w, h);
    return {
      background: solid("#f3ede1"),
      layers: [
        slantBand(-w * 0.3, h * 0.52, w * 1.7, h * 1.2, solid("#5b6057"), -22, "Diagonal field"),
        {
          ...makeImage({ x: w * 0.06, y: h * 0.56, width: w * 0.42, height: h * 0.36, mask: "rounded", cornerRadius: 22 }),
          stroke: { enabled: true, width: 3, color: "#f3ede1" },
          shadow: { enabled: true, x: 0, y: 12, blur: 26, color: "#1c1917", opacity: 0.28 },
        },
        circle(w * 0.86, h * 0.6, u * 0.03, solid("#5b6057"), "Accent dot"),
        makeLogo({ x: w * 0.06, y: h * 0.08, width: 76, height: 76 }),
        makeHeading("কোণাকুনি ভাগ", { x: w * 0.5, y: h * 0.1, width: w * 0.44, height: h * 0.28, fill: "#1c1917", fontSize: 60, align: "left" }),
        handle("@yourpage", w * 0.5, h * 0.4, w * 0.4, "#5b6057", "left"),
      ],
    };
  },
};

// 5. Stacked Thirds — photo fills the middle horizontal third ----------------
const stackedThirds: TemplateDef = {
  id: "abstract-stacked-thirds",
  name: "Stacked Thirds",
  nameBn: "স্ট্যাকড থার্ডস",
  category: "Abstract",
  palette: { primary: "#f7f3ec", secondary: "#606c38", accent: "#606c38", text: "#1c1917", textAlt: "#606c38" },
  tags: ["thirds", "stacked", "band", "editorial"],
  build: (w, h) => {
    const rh = Math.max(6, h * 0.008);
    return {
      background: solid("#f7f3ec"),
      layers: [
        band(0, 0, w, h / 3, solid("#f7f3ec"), "Top band"),
        band(0, h / 3 - rh, w, rh, solid("#606c38"), "Top rule"),
        makeImage({ x: 0, y: h / 3, width: w, height: h / 3, mask: "rect", cornerRadius: 0 }),
        band(0, (2 * h) / 3, w, h / 3, solid("#606c38"), "Bottom band"),
        makeLogo({ x: w * 0.06, y: h * 0.045, width: 62, height: 62, mask: "circle" }),
        makeHeading("তিন ভাগের গল্প", { x: w * 0.06, y: h * 0.14, width: w * 0.88, height: h * 0.15, fill: "#1c1917", fontSize: 66, align: "left" }),
        handle("@yourpage", w * 0.06, h * 0.85, w * 0.6, "#f7f3ec", "left"),
      ],
    };
  },
};

export const ABSTRACT_D: TemplateDef[] = [hexRight, centerColumn, pillUpper, diagonalSplit, stackedThirds];
