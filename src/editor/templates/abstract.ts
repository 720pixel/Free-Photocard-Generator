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

// 1. Neon Overlay — FULL-BLEED photo with a translucent panel over it ---------
const neonOverlay: TemplateDef = {
  id: "abstract-neon-overlay",
  name: "Neon Overlay",
  nameBn: "নিয়ন ওভারলে",
  category: "Abstract",
  palette: { primary: "#1a0b2e", secondary: "#ff71ce", accent: "#01cdfe", text: "#ffffff", textAlt: "#01cdfe" },
  tags: ["vaporwave", "fullbleed", "overlay", "glass"],
  build: (w, h) => ({
    background: solid("#1a0b2e"),
    layers: [
      {
        ...makeImage({ x: 0, y: 0, width: w, height: h, mask: "rect", cornerRadius: 0 }),
        overlay: { fill: linear(160, [{ color: "#01cdfe", offset: 0 }, { color: "#b967ff", offset: 1 }]), blend: "soft-light", opacity: 0.4 },
      },
      {
        ...makeShape({ name: "Text panel", shape: "rounded", x: w * 0.06, y: h * 0.64, width: w * 0.88, height: h * 0.28, fill: solid("#160826") }),
        cornerRadius: 26,
        opacity: 0.58,
        stroke: { enabled: true, width: 1.5, color: "#ff71ce" },
      },
      makeLogo({ x: w * 0.06, y: h * 0.05, width: 86, height: 86, mask: "circle" }),
      {
        ...makeHeading("স্বপ্নের শহর", { x: w * 0.1, y: h * 0.68, width: w * 0.8, height: h * 0.16, fill: "#ffffff", fontSize: 68, align: "left" }),
        glow: { enabled: true, color: "#ff71ce", strength: 18 },
      },
      handle("@yourpage", w * 0.1, h * 0.85, w * 0.8, "#01cdfe", "left"),
    ],
  }),
};

// 2. Primary Circle — small CIRCULAR photo top-left, big type -----------------
const primaryCircle: TemplateDef = {
  id: "abstract-primary-circle",
  name: "Primary Circle",
  nameBn: "প্রাইমারি সার্কেল",
  category: "Abstract",
  palette: { primary: "#f4f1ea", secondary: "#e63946", accent: "#1d3557", text: "#1d1d1d", textAlt: "#e63946" },
  tags: ["bauhaus", "primary", "circle", "typography"],
  build: (w, h) => {
    const u = Math.min(w, h);
    const ps = u * 0.32;
    return {
      background: solid("#f4f1ea"),
      layers: [
        band(w * 0.9, 0, w * 0.1, h, solid("#e63946"), "Red edge"),
        circle(w * 0.8, h * 0.82, u * 0.12, solid("#1d3557"), "Blue disc"),
        makeShape({ name: "Yellow tri", shape: "triangle", x: w * 0.6, y: h * 0.7, width: u * 0.18, height: u * 0.18, fill: solid("#ffd23f"), rotation: 18 }),
        {
          ...makeImage({ x: w * 0.06, y: h * 0.06, width: ps, height: ps, mask: "circle", cornerRadius: 0 }),
          stroke: { enabled: true, width: 6, color: "#1d3557" },
        },
        makeLogo({ x: w * 0.72, y: h * 0.06, width: 80, height: 80 }),
        {
          ...makeHeading("বড় অক্ষরে খবর", { x: w * 0.06, y: h * 0.44, width: w * 0.82, height: h * 0.42, fill: "#1d1d1d", fontSize: 104, fontWeight: 800, align: "left" }),
          letterSpacing: -1,
        },
      ],
    };
  },
};

// 3. Split Column — TALL photo occupying the right half -----------------------
const splitColumn: TemplateDef = {
  id: "abstract-split-column",
  name: "Split Column",
  nameBn: "স্প্লিট কলাম",
  category: "Abstract",
  palette: { primary: "#ffe8d6", secondary: "#6b705c", accent: "#cb997e", text: "#ffe8d6", textAlt: "#3a2e28" },
  tags: ["earth", "split", "column", "half"],
  build: (w, h) => {
    const u = Math.min(w, h);
    return {
      background: solid("#ffe8d6"),
      layers: [
        band(0, 0, w * 0.52, h, solid("#6b705c"), "Left panel"),
        {
          ...makeImage({ x: w * 0.52, y: 0, width: w * 0.48, height: h, mask: "rect", cornerRadius: 0 }),
          overlay: { fill: solid("#3a2e28"), blend: "multiply", opacity: 0.12 },
        },
        circle(w * 0.24, h * 0.2, u * 0.08, solid("#cb997e"), "Clay dot"),
        makeLogo({ x: w * 0.07, y: h * 0.08, width: 78, height: 78 }),
        makeHeading("মাটির গল্প", { x: w * 0.07, y: h * 0.4, width: w * 0.4, height: h * 0.32, fill: "#ffe8d6", fontSize: 70, align: "left" }),
        handle("@yourpage", w * 0.07, h * 0.86, w * 0.4, "#cb997e", "left"),
      ],
    };
  },
};

// 4. Sunset Base — photo in a BOTTOM-anchored wide band -----------------------
const sunsetBase: TemplateDef = {
  id: "abstract-sunset-base",
  name: "Sunset Base",
  nameBn: "সানসেট বেস",
  category: "Abstract",
  palette: { primary: "#ff9a3c", secondary: "#ff5e78", accent: "#6a2c70", text: "#ffffff", textAlt: "#6a2c70" },
  tags: ["sunset", "band", "warm", "bottom"],
  build: (w, h) => {
    const u = Math.min(w, h);
    return {
      background: linear(180, [
        { color: "#f9d423", offset: 0 },
        { color: "#ff8c42", offset: 0.4 },
        { color: "#ff5e78", offset: 0.72 },
        { color: "#6a2c70", offset: 1 },
      ]),
      layers: [
        { ...circle(w * 0.5, h * 0.17, u * 0.14, solid("#fff3c4"), "Sun halo"), opacity: 0.45 },
        circle(w * 0.5, h * 0.17, u * 0.1, solid("#ffe29f"), "Sun"),
        {
          ...makeImage({ x: 0, y: h * 0.55, width: w, height: h * 0.45, mask: "rect", cornerRadius: 0 }),
          overlay: { fill: linear(0, [{ color: "#6a2c70", offset: 0 }, { color: "#00000000", offset: 1 }]), blend: "soft-light", opacity: 0.3 },
        },
        makeLogo({ x: w * 0.5 - 40, y: h * 0.03, width: 80, height: 80, mask: "circle" }),
        {
          ...makeHeading("সূর্যাস্তের রঙ", { x: w * 0.08, y: h * 0.35, width: w * 0.84, height: h * 0.16, fill: "#ffffff", fontSize: 72 }),
          shadow: { enabled: true, x: 0, y: 3, blur: 16, color: "#6a2c70", opacity: 0.4 },
        },
      ],
    };
  },
};

// 5. Arch Window — photo inside an ARCH shape, centered high ------------------
const archWindow: TemplateDef = {
  id: "abstract-arch-window",
  name: "Arch Window",
  nameBn: "আর্চ উইন্ডো",
  category: "Abstract",
  palette: { primary: "#fde2e4", secondary: "#a2d2ff", accent: "#cdb4db", text: "#4a4e69", textAlt: "#cdb4db" },
  tags: ["arch", "window", "pastel", "soft"],
  build: (w, h) => {
    const u = Math.min(w, h);
    const aw = u * 0.56;
    const ax = w / 2 - aw / 2;
    const ay = h * 0.06;
    const ah = u * 0.62;
    const pad = u * 0.028;
    return {
      background: solid("#fde2e4"),
      layers: [
        circle(w * 0.13, h * 0.82, u * 0.1, solid("#a2d2ff"), "Deco 1"),
        circle(w * 0.87, h * 0.7, u * 0.07, solid("#ffc8dd"), "Deco 2"),
        { ...makeShape({ name: "Arch back", shape: "rounded", x: ax, y: ay, width: aw, height: ah, fill: solid("#cdb4db") }), cornerRadius: aw * 0.5 },
        {
          ...makeImage({ x: ax + pad, y: ay + pad, width: aw - pad * 2, height: ah - pad * 2, mask: "rounded", cornerRadius: (aw - pad * 2) * 0.5 }),
        },
        makeLogo({ x: w * 0.06, y: h * 0.04, width: 72, height: 72, mask: "circle" }),
        makeHeading("শান্ত রূপ", { x: w * 0.1, y: h * 0.74, width: w * 0.8, height: h * 0.16, fill: "#4a4e69", fontSize: 66 }),
      ],
    };
  },
};

// 6. Tilted Card — OFFSET photo card rotated a few degrees --------------------
const tiltedCard: TemplateDef = {
  id: "abstract-tilted-card",
  name: "Tilted Card",
  nameBn: "টিল্টেড কার্ড",
  category: "Abstract",
  palette: { primary: "#0a0a12", secondary: "#00f0ff", accent: "#ff2d95", text: "#ffffff", textAlt: "#00f0ff" },
  tags: ["neon", "tilt", "card", "dark"],
  build: (w, h) => {
    const u = Math.min(w, h);
    return {
      background: solid("#0a0a12"),
      layers: [
        { ...slantBand(-w * 0.1, h * 0.08, w * 1.3, u * 0.05, solid("#ff2d95"), -12, "Slash 1"), opacity: 0.75 },
        { ...slantBand(-w * 0.1, h * 0.78, w * 1.3, u * 0.05, solid("#00f0ff"), -12, "Slash 2"), opacity: 0.7 },
        circle(w * 0.86, h * 0.5, u * 0.14, radial([{ color: "#ff2d95", offset: 0 }, { color: "#0a0a1200", offset: 1 }]), "Glow"),
        {
          ...makeImage({ x: w * 0.22, y: h * 0.2, width: w * 0.52, height: h * 0.36, mask: "rounded", cornerRadius: 20 }),
          rotation: 6,
          stroke: { enabled: true, width: 3, color: "#00f0ff" },
          shadow: { enabled: true, x: 0, y: 18, blur: 34, color: "#000000", opacity: 0.55 },
        },
        makeLogo({ x: w * 0.06, y: h * 0.05, width: 82, height: 82 }),
        {
          ...makeHeading("বাঁকা ফ্রেম", { x: w * 0.08, y: h * 0.72, width: w * 0.84, height: h * 0.16, fill: "#ffffff", fontSize: 70, align: "left" }),
          glow: { enabled: true, color: "#00f0ff", strength: 22 },
        },
      ],
    };
  },
};

// 7. Center Slice — photo as a thin HORIZONTAL strip through the middle -------
const centerSlice: TemplateDef = {
  id: "abstract-center-slice",
  name: "Center Slice",
  nameBn: "সেন্টার স্লাইস",
  category: "Abstract",
  palette: { primary: "#ffffff", secondary: "#111111", accent: "#ef233c", text: "#111111", textAlt: "#ef233c" },
  tags: ["mono", "strip", "editorial", "minimal"],
  build: (w, h) => ({
    background: solid("#ffffff"),
    layers: [
      band(0, h * 0.425, w, h * 0.006, solid("#ef233c"), "Rule top"),
      makeImage({ x: 0, y: h * 0.44, width: w, height: h * 0.14, mask: "rect", cornerRadius: 0, filterPreset: "Noir" }),
      band(0, h * 0.585, w, h * 0.006, solid("#ef233c"), "Rule bottom"),
      makeLogo({ x: w * 0.06, y: h * 0.06, width: 78, height: 78 }),
      {
        ...makeHeading("মাঝের রেখা", { x: w * 0.06, y: h * 0.12, width: w * 0.88, height: h * 0.26, fill: "#111111", fontSize: 96, fontWeight: 800, align: "left" }),
        letterSpacing: -2,
      },
      handle("EST. 2026", w * 0.06, h * 0.66, w * 0.6, "#ef233c", "left"),
    ],
  }),
};

// 8. Orbit Bleed — large CIRCLE photo bleeding off one edge -------------------
const orbitBleed: TemplateDef = {
  id: "abstract-orbit-bleed",
  name: "Orbit Bleed",
  nameBn: "অরবিট ব্লিড",
  category: "Abstract",
  palette: { primary: "#020318", secondary: "#43e97b", accent: "#38f9d7", text: "#ffffff", textAlt: "#43e97b" },
  tags: ["aurora", "circle", "bleed", "gradient"],
  build: (w, h) => {
    const u = Math.min(w, h);
    const r = u * 0.42;
    const cx = w * 0.82;
    const cy = h * 0.5;
    return {
      background: linear(160, [
        { color: "#020318", offset: 0 },
        { color: "#0a3d3a", offset: 0.6 },
        { color: "#134e4a", offset: 1 },
      ]),
      layers: [
        { ...dashedRing(cx, cy, r * 1.12, "#38f9d7", [2, 16], "Halo ring"), opacity: 0.5 },
        {
          ...makeImage({ x: cx - r, y: cy - r, width: r * 2, height: r * 2, mask: "circle", cornerRadius: 0 }),
          glow: { enabled: true, color: "#38f9d7", strength: 28 },
        },
        makeLogo({ x: w * 0.06, y: h * 0.05, width: 82, height: 82, mask: "circle" }),
        {
          ...makeHeading("আলোর কক্ষপথ", { x: w * 0.06, y: h * 0.68, width: w * 0.52, height: h * 0.2, fill: "#ffffff", fontSize: 62, align: "left" }),
          glow: { enabled: true, color: "#43e97b", strength: 18 },
        },
        handle("@yourpage", w * 0.06, h * 0.88, w * 0.5, "#43e97b", "left"),
      ],
    };
  },
};

// 9. Quad Grid — photo in the TOP-LEFT quadrant of a 2x2 color grid ----------
const quadGrid: TemplateDef = {
  id: "abstract-quad-grid",
  name: "Quad Grid",
  nameBn: "কোয়াড গ্রিড",
  category: "Abstract",
  palette: { primary: "#1b3a4b", secondary: "#ff6b6b", accent: "#ffd166", text: "#ffffff", textAlt: "#2ec4b6" },
  tags: ["grid", "colorblock", "quadrant", "bold"],
  build: (w, h) => {
    const u = Math.min(w, h);
    return {
      background: solid("#1b3a4b"),
      layers: [
        band(w * 0.5, 0, w * 0.5, h * 0.5, solid("#ff6b6b"), "TR coral"),
        band(0, h * 0.5, w * 0.5, h * 0.5, solid("#ffd166"), "BL yellow"),
        band(w * 0.5, h * 0.5, w * 0.5, h * 0.5, solid("#1b3a4b"), "BR navy"),
        makeImage({ x: 0, y: 0, width: w * 0.5, height: h * 0.5, mask: "rect", cornerRadius: 0 }),
        circle(w * 0.5, h * 0.5, u * 0.085, solid("#2ec4b6"), "Center dot"),
        makeLogo({ x: w * 0.71, y: h * 0.08, width: 78, height: 78 }),
        makeHeading("চার রঙের গ্রিড", { x: w * 0.54, y: h * 0.58, width: w * 0.42, height: h * 0.34, fill: "#ffffff", fontSize: 60, align: "left" }),
        handle("@yourpage", w * 0.06, h * 0.9, w * 0.4, "#1b3a4b", "left"),
      ],
    };
  },
};

// 10. Shard Corner — small SQUARE photo bottom-right with diagonal shards -----
const shardCorner: TemplateDef = {
  id: "abstract-shard-corner",
  name: "Shard Corner",
  nameBn: "শার্ড কর্নার",
  category: "Abstract",
  palette: { primary: "#0d0d17", secondary: "#ff006e", accent: "#3a86ff", text: "#ffffff", textAlt: "#ffbe0b" },
  tags: ["prism", "shards", "corner", "vibrant"],
  build: (w, h) => {
    const u = Math.min(w, h);
    const ps = u * 0.36;
    return {
      background: solid("#0d0d17"),
      layers: [
        makeShape({ name: "s1", shape: "triangle", x: w * 0.6, y: -h * 0.04, width: u * 0.55, height: u * 0.55, fill: solid("#ff006e"), rotation: -18 }),
        makeShape({ name: "s2", shape: "triangle", x: -w * 0.06, y: h * 0.3, width: u * 0.5, height: u * 0.5, fill: solid("#3a86ff"), rotation: 24 }),
        makeShape({ name: "s3", shape: "triangle", x: w * 0.08, y: h * 0.72, width: u * 0.4, height: u * 0.4, fill: solid("#ffbe0b"), rotation: -30 }),
        {
          ...makeImage({ x: w * 0.58, y: h * 0.58, width: ps, height: ps, mask: "rounded", cornerRadius: 10 }),
          stroke: { enabled: true, width: 3, color: "#ffffff" },
        },
        makeLogo({ x: w * 0.06, y: h * 0.88, width: 76, height: 76 }),
        makeHeading("ভাঙা কাচ", { x: w * 0.06, y: h * 0.1, width: w * 0.6, height: h * 0.24, fill: "#ffffff", fontSize: 66, align: "left" }),
      ],
    };
  },
};

// 11. Dot Screen — photo behind a HALFTONE dot cluster, upper area -----------
const dotScreen: TemplateDef = {
  id: "abstract-dot-screen",
  name: "Dot Screen",
  nameBn: "ডট স্ক্রিন",
  category: "Abstract",
  palette: { primary: "#fdf0d5", secondary: "#003049", accent: "#c1121f", text: "#003049", textAlt: "#c1121f" },
  tags: ["halftone", "dots", "retro", "print"],
  build: (w, h) => {
    const px = w * 0.12;
    const py = h * 0.08;
    const pw = w * 0.76;
    const ph = h * 0.42;
    const cols = 14;
    const rows = Math.max(6, Math.round((cols * ph) / pw));
    const gx = pw / cols;
    const gy = ph / rows;
    const maxR = Math.min(gx, gy) * 0.48;
    const dots = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const t = c / (cols - 1); // fade left -> right, revealing photo on the right
        const rad = maxR * (1 - t * 0.92);
        if (rad < 0.8) continue;
        dots.push({ ...circle(px + gx * (c + 0.5), py + gy * (r + 0.5), rad, solid("#003049"), `d${r}-${c}`), opacity: 0.9 });
      }
    }
    return {
      background: solid("#fdf0d5"),
      layers: [
        makeImage({ x: px, y: py, width: pw, height: ph, mask: "rounded", cornerRadius: 16 }),
        ...dots,
        makeLogo({ x: w * 0.84, y: h * 0.88, width: 76, height: 76 }),
        makeHeading("হাফটোন স্ক্রিন", { x: w * 0.08, y: h * 0.58, width: w * 0.72, height: h * 0.24, fill: "#003049", fontSize: 72, align: "left" }),
        handle("@yourpage", w * 0.08, h * 0.86, w * 0.5, "#c1121f", "left"),
      ],
    };
  },
};

// 12. Gem Facet — photo in a diamond/gem masked region, lower-left -----------
const gemFacet: TemplateDef = {
  id: "abstract-gem-facet",
  name: "Gem Facet",
  nameBn: "জেম ফ্যাসেট",
  category: "Abstract",
  palette: { primary: "#052e28", secondary: "#10b981", accent: "#fbbf24", text: "#ffffff", textAlt: "#34d399" },
  tags: ["emerald", "geometric", "gem", "facet"],
  build: (w, h) => {
    const u = Math.min(w, h);
    const r = u * 0.2;
    const cx = w * 0.3;
    const cy = h * 0.66;
    const side = r * 2 * 1.16;
    return {
      background: solid("#052e28"),
      layers: [
        makeShape({ name: "Facet 1", shape: "triangle", x: w * 0.66, y: h * 0.08, width: u * 0.3, height: u * 0.3, fill: solid("#10b981"), rotation: 12 }),
        makeShape({ name: "Facet 2", shape: "triangle", x: w * 0.78, y: h * 0.5, width: u * 0.22, height: u * 0.22, fill: solid("#34d399"), rotation: -24 }),
        { ...makeShape({ name: "Gem frame", shape: "rect", x: cx - side / 2, y: cy - side / 2, width: side, height: side, fill: solid("#fbbf24"), rotation: 45 }) },
        {
          ...makeImage({ x: cx - r, y: cy - r, width: r * 2, height: r * 2, mask: "circle", cornerRadius: 0 }),
          stroke: { enabled: true, width: 4, color: "#052e28" },
        },
        makeLogo({ x: w * 0.82, y: h * 0.05, width: 78, height: 78, mask: "circle" }),
        makeHeading("সবুজ রত্ন", { x: w * 0.08, y: h * 0.12, width: w * 0.84, height: h * 0.22, fill: "#ffffff", fontSize: 72, align: "left" }),
      ],
    };
  },
};

// 13. Edge Strip — narrow VERTICAL photo strip on the left edge --------------
const edgeStrip: TemplateDef = {
  id: "abstract-edge-strip",
  name: "Edge Strip",
  nameBn: "এজ স্ট্রিপ",
  category: "Abstract",
  palette: { primary: "#f5f5f4", secondary: "#1c1917", accent: "#f97316", text: "#1c1917", textAlt: "#f97316" },
  tags: ["minimal", "strip", "vertical", "clean"],
  build: (w, h) => {
    const u = Math.min(w, h);
    return {
      background: solid("#f5f5f4"),
      layers: [
        makeImage({ x: 0, y: 0, width: w * 0.16, height: h, mask: "rect", cornerRadius: 0 }),
        band(w * 0.16, 0, Math.max(5, w * 0.006), h, solid("#f97316"), "Accent rule"),
        circle(w * 0.88, h * 0.14, u * 0.05, solid("#f97316"), "Accent dot"),
        makeLogo({ x: w * 0.24, y: h * 0.08, width: 74, height: 74 }),
        makeHeading("পাশের রেখা", { x: w * 0.24, y: h * 0.38, width: w * 0.68, height: h * 0.3, fill: "#1c1917", fontSize: 78, align: "left" }),
        handle("— minimal —", w * 0.24, h * 0.82, w * 0.5, "#78716c", "left"),
      ],
    };
  },
};

// 14. Ring Target — photo centered small with CONCENTRIC rings around it ------
const ringTarget: TemplateDef = {
  id: "abstract-ring-target",
  name: "Ring Target",
  nameBn: "রিং টার্গেট",
  category: "Abstract",
  palette: { primary: "#fff7ed", secondary: "#fb7185", accent: "#2dd4bf", text: "#7c2d12", textAlt: "#fb7185" },
  tags: ["rings", "concentric", "target", "warm"],
  build: (w, h) => {
    const u = Math.min(w, h);
    const cx = w * 0.5;
    const cy = h * 0.42;
    const r = u * 0.16;
    const ring = (rr: number, color: string, dash: number[], name: string) =>
      makeShape({ name, shape: "circle", x: cx - rr, y: cy - rr, width: rr * 2, height: rr * 2, fill: { kind: "none" }, stroke: { enabled: true, width: 4, color }, dash });
    return {
      background: radial([
        { color: "#fff7ed", offset: 0 },
        { color: "#fed7aa", offset: 1 },
      ]),
      layers: [
        ring(r * 2.5, "#fb7185", [3, 14], "Ring 3"),
        ring(r * 1.95, "#2dd4bf", [], "Ring 2"),
        ring(r * 1.42, "#fb7185", [3, 14], "Ring 1"),
        {
          ...makeImage({ x: cx - r, y: cy - r, width: r * 2, height: r * 2, mask: "circle", cornerRadius: 0 }),
          stroke: { enabled: true, width: 5, color: "#ffffff" },
        },
        makeLogo({ x: w * 0.5 - 38, y: h * 0.05, width: 76, height: 76, mask: "circle" }),
        makeHeading("লক্ষ্যবিন্দু", { x: w * 0.08, y: h * 0.78, width: w * 0.84, height: h * 0.16, fill: "#7c2d12", fontSize: 70 }),
      ],
    };
  },
};

// 15. Top Banner — photo full-width TOP THIRD only ---------------------------
const topBanner: TemplateDef = {
  id: "abstract-top-banner",
  name: "Top Banner",
  nameBn: "টপ ব্যানার",
  category: "Abstract",
  palette: { primary: "#f8fafc", secondary: "#0f172a", accent: "#ef4444", text: "#0f172a", textAlt: "#ef4444" },
  tags: ["editorial", "banner", "top", "clean"],
  build: (w, h) => {
    const u = Math.min(w, h);
    return {
      background: solid("#f8fafc"),
      layers: [
        makeImage({ x: 0, y: 0, width: w, height: h * 0.34, mask: "rect", cornerRadius: 0 }),
        band(0, h * 0.34, w, Math.max(8, h * 0.014), solid("#ef4444"), "Accent band"),
        band(w * 0.06, h * 0.42, u * 0.14, Math.max(6, h * 0.008), solid("#0f172a"), "Kicker rule"),
        makeLogo({ x: w * 0.06, y: h * 0.4, width: 72, height: 72 }),
        makeHeading("শিরোনাম এখানে", { x: w * 0.06, y: h * 0.52, width: w * 0.88, height: h * 0.3, fill: "#0f172a", fontSize: 82, fontWeight: 800, align: "left" }),
        handle("@yourpage", w * 0.06, h * 0.9, w * 0.6, "#ef4444", "left"),
      ],
    };
  },
};

export const ABSTRACT_TEMPLATES: TemplateDef[] = [
  neonOverlay,
  primaryCircle,
  splitColumn,
  sunsetBase,
  archWindow,
  tiltedCard,
  centerSlice,
  orbitBleed,
  quadGrid,
  shardCorner,
  dotScreen,
  gemFacet,
  edgeStrip,
  ringTarget,
  topBanner,
];
