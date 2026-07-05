import { makeHeading, makeImage, makeLogo, makeShape, makeText, solid, linear } from "../factories";
import { band, circle, dashedRing, slantBand, tornBand } from "./helpers";
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

// 1. Torn Base — photo fills the bottom ~58%, ragged torn top edge -------------
const tornBase: TemplateDef = {
  id: "abstract-torn-base",
  name: "Torn Base",
  nameBn: "ছেঁড়া বেস",
  category: "Abstract",
  palette: { primary: "#f5f0e6", secondary: "#8a5a44", accent: "#b07a56", text: "#2b2621", textAlt: "#8a5a44" },
  tags: ["riso", "torn", "editorial", "paper"],
  build: (w, h) => {
    return {
      background: solid("#f5f0e6"),
      layers: [
        makeImage({ x: 0, y: h * 0.38, width: w, height: h * 0.62, mask: "rect", cornerRadius: 0 }),
        tornBand(w, h, h * 0.42, solid("#f5f0e6"), { amplitude: h * 0.02, segments: 26, side: "above", seed: 11, name: "Torn edge" }),
        band(0, h * 0.42 - 2, w, 4, solid("#8a5a44"), "Tear rule"),
        makeLogo({ x: w * 0.06, y: h * 0.06, width: 78, height: 78 }),
        {
          ...makeHeading("ছেঁড়া সীমানা", { x: w * 0.08, y: h * 0.16, width: w * 0.84, height: h * 0.2, fill: "#2b2621", fontSize: 80, align: "left" }),
          letterSpacing: -1,
        },
        handle("@yourpage", w * 0.08, h * 0.86, w * 0.6, "#f5f0e6", "left"),
      ],
    };
  },
};

// 2. Dead Center Square — small square photo dead center on a bold field ------
const deadCenterSquare: TemplateDef = {
  id: "abstract-dead-center-square",
  name: "Dead Center Square",
  nameBn: "কেন্দ্রীয় বর্গ",
  category: "Abstract",
  palette: { primary: "#faf7f0", secondary: "#1c1917", accent: "#a14234", text: "#1c1917", textAlt: "#a14234" },
  tags: ["minimal", "square", "centered", "bold"],
  build: (w, h) => {
    const u = Math.min(w, h);
    const cx = w * 0.5;
    const cy = h * 0.42;
    const size = u * 0.36;
    return {
      background: solid("#faf7f0"),
      layers: [
        makeLogo({ x: w * 0.5 - 39, y: h * 0.06, width: 78, height: 78, mask: "circle" }),
        {
          ...makeImage({ x: cx - size / 2, y: cy - size / 2, width: size, height: size, mask: "rect", cornerRadius: 0 }),
          stroke: { enabled: true, width: 6, color: "#1c1917" },
          shadow: { enabled: true, x: 0, y: 12, blur: 24, color: "#1c1917", opacity: 0.22 },
        },
        makeHeading("এক বর্গে খবর", { x: w * 0.1, y: cy + size / 2 + h * 0.06, width: w * 0.8, height: h * 0.18, fill: "#1c1917", fontSize: 68, align: "center" }),
        handle("@yourpage", w * 0.25, h * 0.9, w * 0.5, "#a14234", "center"),
      ],
    };
  },
};

// 3. Letterbox Top — wide short strip pinned to the top edge ------------------
const letterboxTop: TemplateDef = {
  id: "abstract-letterbox-top",
  name: "Letterbox Top",
  nameBn: "লেটারবক্স টপ",
  category: "Abstract",
  palette: { primary: "#ede6d6", secondary: "#2b2621", accent: "#6b7a4f", text: "#2b2621", textAlt: "#6b7a4f" },
  tags: ["letterbox", "kicker", "bold", "mono"],
  build: (w, h) => {
    return {
      background: solid("#ede6d6"),
      layers: [
        makeImage({ x: 0, y: 0, width: w, height: h * 0.18, mask: "rect", cornerRadius: 0 }),
        band(0, h * 0.18, w, Math.max(6, h * 0.008), solid("#6b7a4f"), "Divider"),
        {
          ...makeLogo({ x: w * 0.06, y: h * 0.05, width: 68, height: 68, mask: "circle" }),
          stroke: { enabled: true, width: 3, color: "#ede6d6" },
        },
        makeText({
          role: "custom",
          name: "Kicker number",
          text: "০১",
          x: w * 0.04,
          y: h * 0.2,
          width: w * 0.55,
          height: h * 0.34,
          fontSize: 220,
          fontWeight: 900,
          fill: "#6b7a4f",
          align: "left",
          autoFit: true,
        }),
        {
          ...makeHeading("বড় শিরোনাম এখানে", { x: w * 0.06, y: h * 0.58, width: w * 0.88, height: h * 0.26, fill: "#2b2621", fontSize: 76, align: "left" }),
          letterSpacing: -1,
        },
        handle("EST. 2026", w * 0.06, h * 0.88, w * 0.6, "#6b7a4f", "left"),
      ],
    };
  },
};

// 4. Slant Mask — photo in a rotated rect crossing the middle diagonally ------
const slantMask: TemplateDef = {
  id: "abstract-slant-mask",
  name: "Slant Mask",
  nameBn: "ঢালু মাস্ক",
  category: "Abstract",
  palette: { primary: "#f3ede1", secondary: "#3f3a34", accent: "#c06a3f", text: "#1c1917", textAlt: "#c06a3f" },
  tags: ["diagonal", "slant", "dynamic", "clay"],
  build: (w, h) => {
    return {
      background: solid("#f3ede1"),
      layers: [
        { ...slantBand(-w * 0.1, h * 0.24, w * 1.2, h * 0.12, solid("#c06a3f"), -10, "Frame top"), opacity: 0.9 },
        {
          ...makeImage({ x: w * 0.1, y: h * 0.32, width: w * 0.8, height: h * 0.36, mask: "rounded", cornerRadius: 18 }),
          rotation: -10,
          stroke: { enabled: true, width: 4, color: "#3f3a34" },
          shadow: { enabled: true, x: 0, y: 14, blur: 30, color: "#3f3a34", opacity: 0.32 },
        },
        { ...slantBand(-w * 0.1, h * 0.64, w * 1.2, h * 0.12, solid("#3f3a34"), -10, "Frame bottom"), opacity: 0.9 },
        makeLogo({ x: w * 0.06, y: h * 0.06, width: 76, height: 76 }),
        {
          ...makeHeading("তির্যক ফ্রেম", { x: w * 0.14, y: h * 0.82, width: w * 0.8, height: h * 0.14, fill: "#1c1917", fontSize: 64, align: "right" }),
          letterSpacing: -1,
        },
      ],
    };
  },
};

// 5. Corner Moon — large circle photo bleeding off the bottom-left corner ----
const cornerMoon: TemplateDef = {
  id: "abstract-corner-moon",
  name: "Corner Moon",
  nameBn: "কর্নার মুন",
  category: "Abstract",
  palette: { primary: "#e8e0d0", secondary: "#5a6650", accent: "#8a5a44", text: "#2b2621", textAlt: "#5a6650" },
  tags: ["earth", "circle", "corner", "bleed"],
  build: (w, h) => {
    const u = Math.min(w, h);
    const cx = w * 0.04;
    const cy = h * 0.96;
    const r = u * 0.42;
    return {
      background: solid("#e8e0d0"),
      layers: [
        { ...dashedRing(cx, cy, r * 1.14, "#5a6650", [3, 14], "Orbit ring"), opacity: 0.7 },
        circle(cx, cy, r * 0.94, radial([{ color: "#8a5a4400", offset: 0.72 }, { color: "#8a5a44", offset: 1 }]), "Rim glow"),
        {
          ...makeImage({ x: cx - r, y: cy - r, width: r * 2, height: r * 2, mask: "circle", cornerRadius: 0 }),
          stroke: { enabled: true, width: 4, color: "#2b2621" },
        },
        makeLogo({ x: w * 0.06, y: h * 0.06, width: 74, height: 74, mask: "circle" }),
        {
          ...makeHeading("মাটির কক্ষপথ", { x: w * 0.14, y: h * 0.1, width: w * 0.8, height: h * 0.2, fill: "#2b2621", fontSize: 66, align: "right" }),
          letterSpacing: -1,
        },
        handle("@yourpage", w * 0.34, h * 0.32, w * 0.6, "#5a6650", "right"),
      ],
    };
  },
};

export const ABSTRACT_B: TemplateDef[] = [
  tornBase,
  deadCenterSquare,
  letterboxTop,
  slantMask,
  cornerMoon,
];
