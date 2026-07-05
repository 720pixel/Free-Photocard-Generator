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

// 1. Left Two-Thirds — photo fills the LEFT ~66%, a narrow oat rail holds a
//    stacked heading on the right, logo anchored bottom of the rail ----------
const leftTwoThirds: TemplateDef = {
  id: "abstract-c-left-twothirds",
  name: "Left Two-Thirds",
  nameBn: "বাম দুই-তৃতীয়াংশ",
  category: "Abstract",
  palette: { primary: "#f5f0e6", secondary: "#ece4d4", accent: "#a8562f", text: "#1c1917", textAlt: "#a8562f" },
  tags: ["twothirds", "rail", "split", "editorial"],
  build: (w, h) => {
    const railX = w * 0.66;
    const railW = w * 0.34;
    return {
      background: solid("#f5f0e6"),
      layers: [
        makeImage({ x: 0, y: 0, width: railX, height: h, mask: "rect", cornerRadius: 0 }),
        band(railX, 0, railW, h, solid("#ece4d4"), "Rail"),
        band(railX + railW * 0.14, h * 0.06, railW * 0.4, Math.max(5, h * 0.007), solid("#a8562f"), "Accent rule"),
        handle("@yourpage", railX + railW * 0.14, h * 0.12, railW * 0.72, "#a8562f", "left"),
        {
          ...makeHeading("বাম পাশের গল্প", { x: railX + railW * 0.14, y: h * 0.3, width: railW * 0.72, height: h * 0.42, fill: "#1c1917", fontSize: 54, align: "left" }),
          letterSpacing: -0.5,
        },
        makeLogo({ x: railX + (railW - 80) / 2, y: h * 0.86, width: 80, height: 80 }),
      ],
    };
  },
};

// 2. Left Arch — photo inside a tall arch on the LEFT, muted clay deco circles
//    and heading on the right (mirror of the centered Arch Window) ----------
const leftArch: TemplateDef = {
  id: "abstract-c-left-arch",
  name: "Left Arch",
  nameBn: "বাম আর্চ",
  category: "Abstract",
  palette: { primary: "#faf7f0", secondary: "#c98a6b", accent: "#c98a6b", text: "#2b2621", textAlt: "#c98a6b" },
  tags: ["arch", "left", "clay", "soft"],
  build: (w, h) => {
    const u = Math.min(w, h);
    const aw = u * 0.5;
    const ax = w * 0.07;
    const ay = h * 0.08;
    const ah = u * 0.62;
    const pad = u * 0.026;
    const rightX = ax + aw + w * 0.06;
    return {
      background: solid("#faf7f0"),
      layers: [
        { ...circle(w * 0.85, h * 0.22, u * 0.09, solid("#c98a6b"), "Deco 1"), opacity: 0.85 },
        { ...circle(w * 0.78, h * 0.56, u * 0.05, solid("#c98a6b"), "Deco 2"), opacity: 0.5 },
        circle(w * 0.92, h * 0.72, u * 0.03, solid("#2b2621"), "Deco 3"),
        { ...makeShape({ name: "Arch back", shape: "rounded", x: ax, y: ay, width: aw, height: ah, fill: solid("#c98a6b") }), cornerRadius: aw * 0.5 },
        makeImage({ x: ax + pad, y: ay + pad, width: aw - pad * 2, height: ah - pad * 2, mask: "rounded", cornerRadius: (aw - pad * 2) * 0.5 }),
        makeLogo({ x: rightX, y: h * 0.08, width: 74, height: 74, mask: "circle" }),
        makeHeading("ডান পাশের আলো", { x: rightX, y: h * 0.5, width: w - rightX - w * 0.06, height: h * 0.3, fill: "#2b2621", fontSize: 58, align: "left" }),
        handle("@yourpage", rightX, h * 0.84, w - rightX - w * 0.06, "#c98a6b", "left"),
      ],
    };
  },
};

// 3. Corner Orbit — small circular photo bottom-right with a dashed orbit ring,
//    large heading fills the top-left; calm oat theme -----------------------
const cornerOrbit: TemplateDef = {
  id: "abstract-c-corner-orbit",
  name: "Corner Orbit",
  nameBn: "কর্নার অরবিট",
  category: "Abstract",
  palette: { primary: "#efe9dd", secondary: "#d9cfbb", accent: "#9c3f2b", text: "#1c1917", textAlt: "#9c3f2b" },
  tags: ["orbit", "corner", "oat", "minimal"],
  build: (w, h) => {
    const u = Math.min(w, h);
    const r = u * 0.13;
    const cx = w * 0.86;
    const cy = h * 0.86;
    return {
      background: radial([
        { color: "#f4eee2", offset: 0 },
        { color: "#efe9dd", offset: 1 },
      ]),
      layers: [
        makeLogo({ x: w * 0.08, y: h * 0.07, width: 72, height: 72, mask: "circle" }),
        {
          ...makeHeading("কোণার গল্প", { x: w * 0.08, y: h * 0.2, width: w * 0.6, height: h * 0.5, fill: "#1c1917", fontSize: 92, fontWeight: 800, align: "left" }),
          letterSpacing: -1,
        },
        handle("@yourpage", w * 0.08, h * 0.74, w * 0.5, "#9c3f2b", "left"),
        { ...dashedRing(cx, cy, r * 1.35, "#9c3f2b", [3, 12], "Orbit ring"), opacity: 0.85 },
        { ...dashedRing(cx, cy, r * 1.7, "#2b2621", [1, 14], "Orbit ring outer"), opacity: 0.25 },
        {
          ...makeImage({ x: cx - r, y: cy - r, width: r * 2, height: r * 2, mask: "circle", cornerRadius: 0 }),
          stroke: { enabled: true, width: 4, color: "#efe9dd" },
        },
      ],
    };
  },
};

// 4. High Right Block — photo spans the RIGHT 68% from the top down to mid
//    canvas; a thick deeper-sand block sits bottom-left with the heading ----
const highRightBlock: TemplateDef = {
  id: "abstract-c-high-right-block",
  name: "High Right Block",
  nameBn: "হাই রাইট ব্লক",
  category: "Abstract",
  palette: { primary: "#f3ede1", secondary: "#e6dcc6", accent: "#b5654a", text: "#2b2621", textAlt: "#b5654a" },
  tags: ["block", "colorblock", "sand", "right"],
  build: (w, h) => {
    const u = Math.min(w, h);
    const photoX = w * 0.32;
    const photoH = h * 0.52;
    const blockW = w * 0.68;
    return {
      background: solid("#f3ede1"),
      layers: [
        makeImage({ x: photoX, y: 0, width: w - photoX, height: photoH, mask: "rect", cornerRadius: 0 }),
        band(0, photoH, blockW, h - photoH, solid("#e6dcc6"), "Block"),
        { ...slantBand(-blockW * 0.1, photoH + (h - photoH) * 0.08, blockW * 1.2, u * 0.03, solid("#b5654a"), -6, "Accent slash"), opacity: 0.9 },
        makeLogo({ x: w * 0.06, y: h * 0.06, width: 76, height: 76 }),
        {
          ...makeHeading("বড় খবরের ব্লক", { x: w * 0.06, y: photoH + (h - photoH) * 0.24, width: blockW * 0.82, height: (h - photoH) * 0.5, fill: "#2b2621", fontSize: 64, fontWeight: 800, align: "left" }),
          letterSpacing: -1,
        },
        handle("@yourpage", w * 0.06, h * 0.92, blockW * 0.7, "#b5654a", "left"),
      ],
    };
  },
};

// 5. Framed Upper Right — photo in a thick-bordered square frame upper-right
//    with a bold offset drop-shadow; heading lower-left aligned left --------
const framedUpperRight: TemplateDef = {
  id: "abstract-c-framed-upper-right",
  name: "Framed Upper Right",
  nameBn: "ফ্রেমড আপার রাইট",
  category: "Abstract",
  palette: { primary: "#e8e0d0", secondary: "#2b2621", accent: "#c2894a", text: "#2b2621", textAlt: "#c2894a" },
  tags: ["frame", "square", "shadow", "editorial"],
  build: (w, h) => {
    const u = Math.min(w, h);
    const s = u * 0.42;
    const fx = w - s - w * 0.09;
    const fy = h * 0.07;
    const offset = u * 0.03;
    return {
      background: solid("#e8e0d0"),
      layers: [
        circle(w * 0.1, h * 0.1, u * 0.03, solid("#c2894a"), "Deco dot"),
        makeShape({ name: "Shadow block", shape: "rect", x: fx + offset, y: fy + offset, width: s, height: s, fill: solid("#c2894a") }),
        {
          ...makeImage({ x: fx, y: fy, width: s, height: s, mask: "rect", cornerRadius: 0 }),
          stroke: { enabled: true, width: 14, color: "#2b2621" },
        },
        makeLogo({ x: w * 0.08, y: h * 0.08, width: 70, height: 70 }),
        {
          ...makeHeading("নিচের বাম শিরোনাম", { x: w * 0.08, y: h * 0.58, width: w * 0.58, height: h * 0.28, fill: "#2b2621", fontSize: 62, align: "left" }),
          letterSpacing: -0.5,
        },
        handle("@yourpage", w * 0.08, h * 0.88, w * 0.5, "#c2894a", "left"),
      ],
    };
  },
};

export const ABSTRACT_C: TemplateDef[] = [
  leftTwoThirds,
  leftArch,
  cornerOrbit,
  highRightBlock,
  framedUpperRight,
];
