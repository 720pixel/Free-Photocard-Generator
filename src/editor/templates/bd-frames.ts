import { makeHeading, makeImage, makeLogo, makeShape, makeText, solid, linear } from "../factories";
import { band, circle, dashedRing, slantBand, tornBand } from "./helpers";
import type { ImageLayer } from "../types";
import type { TemplateDef } from "./types";

const MAROON = "#5a0a1a";
const RED = "#c40d1e";
const CREAM = "#fdf0cf";
const CHARCOAL = "#242424";
const YELLOW = "#f5b800";

// A photo that fills a region edge-to-edge (cover, rect mask) so template art
// (torn bands, wedges) drawn on top frames it naturally instead of a floating box.
function fillPhoto(x: number, y: number, w: number, h: number, extra: Partial<ImageLayer> = {}): ImageLayer {
  return makeImage({ x, y, width: w, height: h, mask: "rect", cornerRadius: 0, fit: "cover", placeholderLabel: "Add photo", ...extra });
}

function dateChip(text: string, x: number, y: number, w: number, color = "#333") {
  return makeText({
    role: "date", name: "Date", text, x, y, width: w, height: 44,
    fontSize: 30, fontWeight: 600, fill: color, align: "center", autoFit: true, bengaliDigits: true,
  });
}

// 1. Torn Paper Trio — photo fills the middle; torn cream (top) and maroon (bottom) bands overlap it.
const tornPaperTrio: TemplateDef = {
  id: "bd-torn-trio",
  name: "Torn Paper Trio",
  nameBn: "টর্ন পেপার ট্রায়ো",
  category: "TV Channel",
  palette: { primary: MAROON, secondary: CREAM, accent: RED, text: "#ffffff", textAlt: MAROON },
  tags: ["torn", "maroon", "cream", "news"],
  build: (w, h) => ({
    background: solid("#ffffff"),
    layers: [
      // photo behind the torn bands, spanning the middle
      fillPhoto(0, h * 0.1, w, h * 0.56),
      // top cream band with torn bottom edge over the photo top
      tornBand(w, h, h * 0.15, solid(CREAM), { side: "above", seed: 3, amplitude: h * 0.011, name: "Cream torn top" }),
      // bottom maroon band with torn top edge over the photo bottom
      tornBand(w, h, h * 0.64, solid(MAROON), { side: "below", seed: 11, amplitude: h * 0.014, name: "Maroon torn bottom" }),
      makeLogo({ x: w / 2 - 52, y: h * 0.02, width: 104, height: 104, mask: "circle" }),
      dateChip("০৫ জুলাই ২০২৬", w * 0.6, h * 0.06, w * 0.36, MAROON),
      makeHeading("Your headline here", {
        x: w * 0.06, y: h * 0.7, width: w * 0.88, height: h * 0.24, fill: "#ffffff", fontSize: 74, align: "center",
      }),
    ],
  }),
};

// 2. Dashed Frame Red — white card, dashed photo frame top, torn red gradient bottom.
const dashedFrameRed: TemplateDef = {
  id: "bd-dashed-red",
  name: "Dashed Frame Red",
  nameBn: "ড্যাশড ফ্রেম রেড",
  category: "Breaking News",
  palette: { primary: MAROON, secondary: "#ffffff", accent: RED, text: "#ffffff", textAlt: MAROON },
  tags: ["dashed", "red", "gradient"],
  build: (w, h) => {
    const tearY = h * 0.56;
    return {
      background: solid("#111111"),
      layers: [
        band(6, 6, w - 12, h - 12, solid("#ffffff"), "White card"),
        fillPhoto(w * 0.06, h * 0.06, w * 0.88, tearY - h * 0.12, { cornerRadius: 0 }),
        {
          ...makeShape({ name: "Dashed frame", shape: "rounded", x: w * 0.045, y: h * 0.045, width: w * 0.91, height: tearY - h * 0.09, fill: { kind: "none" } }),
          cornerRadius: 16,
          stroke: { enabled: true, width: 3, color: RED },
          dash: [12, 9],
        },
        tornBand(w, h, tearY, linear(90, [{ color: "#3a0710", offset: 0 }, { color: RED, offset: 1 }]), { side: "below", seed: 5, amplitude: h * 0.012, name: "Red torn bottom" }),
        makeLogo({ x: w * 0.06, y: h * 0.02, width: 92, height: 92, mask: "circle" }),
        makeHeading("Breaking news headline", {
          x: w * 0.06, y: tearY + h * 0.05, width: w * 0.88, height: h * 0.26, fill: "#ffffff", fontSize: 74,
        }),
        makeText({ role: "site", name: "Site", text: "@yourpage", x: w * 0.06, y: h * 0.92, width: w * 0.88, height: 50, fontSize: 30, fill: "#ffe3c2", align: "center" }),
      ],
    };
  },
};

// 3. Circle Spotlight — diagonal split, circular photo center, dashed ring accent.
const circleSpotlight: TemplateDef = {
  id: "bd-circle-spotlight",
  name: "Circle Spotlight",
  nameBn: "সার্কেল স্পটলাইট",
  category: "TV Channel",
  palette: { primary: MAROON, secondary: "#eceae5", accent: RED, text: "#ffffff", textAlt: MAROON },
  tags: ["circle", "spotlight", "diagonal"],
  build: (w, h) => {
    const cx = w * 0.5, cy = h * 0.54, r = Math.min(w, h) * 0.3;
    return {
      background: solid("#eeece7"),
      layers: [
        slantBand(-w * 0.2, h * 0.58, w * 1.5, h * 0.7, solid(MAROON), -8, "Diagonal wedge"),
        dashedRing(cx, cy, r * 1.16, RED, [11, 9]),
        makeImage({ x: cx - r, y: cy - r, width: r * 2, height: r * 2, mask: "circle", cornerRadius: 0, placeholderLabel: "Add photo" }),
        makeLogo({ x: cx - 50, y: h * 0.05, width: 100, height: 100, mask: "circle" }),
        dateChip("০৫ জুলাই ২০২৬", cx - w * 0.17, h * 0.18, w * 0.34, "#444"),
        makeHeading("Headline here", { x: w * 0.06, y: h * 0.84, width: w * 0.88, height: h * 0.13, fill: "#ffffff", fontSize: 62 }),
      ],
    };
  },
};

// 4. Crumpled Poster — red gradient, framed centered photo, heading below.
const crumpledPoster: TemplateDef = {
  id: "bd-crumpled-poster",
  name: "Crumpled Poster",
  nameBn: "ক্রাম্পলড পোস্টার",
  category: "Breaking News",
  palette: { primary: RED, secondary: "#0d2c52", accent: "#ffffff", text: "#ffffff", textAlt: "#ffffff" },
  tags: ["crumpled", "red", "poster"],
  build: (w, h) => {
    const px = w * 0.1, py = h * 0.22, pw = w * 0.8, ph = h * 0.42;
    return {
      background: linear(135, [{ color: "#7a0f12", offset: 0 }, { color: "#a51419", offset: 0.5 }, { color: "#6c0d10", offset: 1 }]),
      layers: [
        makeLogo({ x: w / 2 - 58, y: h * 0.06, width: 116, height: 116, mask: "circle" }),
        { ...makeShape({ name: "Frame outline", shape: "rounded", x: px - 14, y: py - 14, width: pw + 28, height: ph + 28, fill: { kind: "none" } }), cornerRadius: 26, stroke: { enabled: true, width: 2, color: "#ffffff" } },
        makeImage({ x: px, y: py, width: pw, height: ph, mask: "rounded", cornerRadius: 18, placeholderLabel: "Add photo" }),
        makeHeading("Your headline here", { x: w * 0.08, y: py + ph + h * 0.04, width: w * 0.84, height: h * 0.2, fill: "#ffffff", fontSize: 72 }),
      ],
    };
  },
};

// 5. Channel Hero — framed hero with headline over, big photo below.
const channelHero: TemplateDef = {
  id: "bd-channel-hero",
  name: "Channel Hero",
  nameBn: "চ্যানেল হিরো",
  category: "TV Channel",
  palette: { primary: "#1a6b3a", secondary: "#0d3b6b", accent: RED, text: "#0d3b6b", textAlt: RED },
  tags: ["hero", "flagship", "channel"],
  build: (w, h) => ({
    background: linear(160, [{ color: "#cfe8f0", offset: 0 }, { color: "#eaf5ee", offset: 1 }]),
    layers: [
      { ...makeShape({ name: "Corner frame", shape: "rounded", x: w * 0.03, y: h * 0.03, width: w * 0.94, height: h * 0.94, fill: { kind: "none" } }), cornerRadius: 20, stroke: { enabled: true, width: 1.5, color: RED }, dash: [6, 8] },
      makeLogo({ x: w / 2 - 50, y: h * 0.03, width: 100, height: 100, mask: "circle" }),
      makeHeading("এখানে আপনার শিরোনাম লিখুন", { x: w * 0.06, y: h * 0.15, width: w * 0.88, height: h * 0.24, fill: "#0d3b6b", fontSize: 76, stroke: { enabled: true, width: 3, color: "#ffffff" } }),
      makeImage({ x: w * 0.06, y: h * 0.42, width: w * 0.88, height: h * 0.44, mask: "rounded", cornerRadius: 28, placeholderLabel: "Add photo" }),
      makeText({ role: "footer", name: "Footer", text: "সংক্ষিপ্ত বিবরণ এখানে", x: w * 0.06, y: h * 0.88, width: w * 0.88, height: h * 0.08, fontSize: 40, fontWeight: 700, fill: "#0d3b6b", align: "center" }),
    ],
  }),
};

// 6. Breaking Slant — black slant band heading, framed photo below.
const breakingSlant: TemplateDef = {
  id: "bd-breaking-slant",
  name: "Breaking Slant",
  nameBn: "ব্রেকিং স্ল্যান্ট",
  category: "Breaking News",
  palette: { primary: "#e60012", secondary: CHARCOAL, accent: "#ffffff", text: "#ffffff", textAlt: CHARCOAL },
  tags: ["slant", "breaking", "bold"],
  build: (w, h) => ({
    background: solid("#ffffff"),
    layers: [
      slantBand(-w * 0.1, h * 0.07, w * 1.2, h * 0.02 + 10, solid("#e60012"), -12, "Red edge top"),
      slantBand(-w * 0.1, h * 0.1, w * 1.2, h * 0.26, solid(CHARCOAL), -12, "Black slant"),
      slantBand(-w * 0.1, h * 0.36, w * 1.2, 10, solid("#e60012"), -12, "Red edge bottom"),
      makeLogo({ x: w * 0.05, y: h * 0.02, width: 90, height: 90 }),
      makeHeading("BREAKING", { x: w * 0.08, y: h * 0.14, width: w * 0.84, height: h * 0.18, rotation: -12, fill: "#ffffff", fontSize: 78 }),
      { ...makeImage({ x: w * 0.08, y: h * 0.46, width: w * 0.84, height: h * 0.46, mask: "rounded", cornerRadius: 16, placeholderLabel: "Add photo" }), stroke: { enabled: true, width: 3, color: "#e60012" } },
    ],
  }),
};

// 7. News Bar Classic — charcoal heading bar, photo below.
const newsBarClassic: TemplateDef = {
  id: "bd-news-bar",
  name: "News Bar Classic",
  nameBn: "নিউজ বার ক্লাসিক",
  category: "Newspaper",
  palette: { primary: CHARCOAL, secondary: MAROON, accent: "#ffffff", text: "#ffffff", textAlt: CHARCOAL },
  tags: ["bar", "classic", "charcoal"],
  build: (w, h) => {
    const barY = h * 0.36, barH = h * 0.22;
    return {
      background: solid("#ffffff"),
      layers: [
        band(0, barY - 8, w, barH + 16, solid(MAROON), "Maroon accent"),
        band(0, barY, w, barH, solid(CHARCOAL), "News bar"),
        makeLogo({ x: w * 0.05, y: h * 0.05, width: 92, height: 92 }),
        dateChip("০৫ জুলাই ২০২৬", w * 0.55, h * 0.07, w * 0.4, "#555"),
        makeHeading("সংবাদ শিরোনাম এখানে", { x: w * 0.05, y: barY + barH * 0.14, width: w * 0.9, height: barH * 0.72, fill: "#ffffff", fontSize: 58 }),
        makeImage({ x: w * 0.08, y: barY + barH + h * 0.03, width: w * 0.84, height: h - (barY + barH) - h * 0.08, mask: "rounded", cornerRadius: 16, placeholderLabel: "Add photo" }),
      ],
    };
  },
};

// 8. Dark Torn Yellow — charcoal top heading, torn yellow rip, photo fills cream bottom.
const darkTornYellow: TemplateDef = {
  id: "bd-dark-torn-yellow",
  name: "Dark Torn Yellow",
  nameBn: "ডার্ক টর্ন ইয়েলো",
  category: "TV Channel",
  palette: { primary: CHARCOAL, secondary: CREAM, accent: YELLOW, text: "#ffffff", textAlt: CHARCOAL },
  tags: ["dark", "torn", "yellow"],
  build: (w, h) => {
    const tearY = h * 0.5;
    return {
      background: solid(CHARCOAL),
      layers: [
        // photo fills the bottom region, torn yellow+cream bands overlap its top
        fillPhoto(0, tearY, w, h - tearY),
        tornBand(w, h, tearY + h * 0.012, solid(YELLOW), { side: "above", seed: 9, amplitude: h * 0.016, name: "Yellow rip" }),
        tornBand(w, h, tearY - h * 0.006, solid(CHARCOAL), { side: "above", seed: 4, amplitude: h * 0.014, name: "Charcoal top" }),
        makeLogo({ x: w * 0.05, y: h * 0.03, width: 92, height: 92 }),
        makeHeading("শিরোনাম এখানে লিখুন", { x: w * 0.06, y: h * 0.1, width: w * 0.88, height: h * 0.3, fill: "#ffffff", fontSize: 74 }),
      ],
    };
  },
};

// 9. Circle Duo — cream card, circular photo, yellow accent circles.
const circleDuo: TemplateDef = {
  id: "bd-circle-duo",
  name: "Circle Duo",
  nameBn: "সার্কেল ডুও",
  category: "TV Channel",
  palette: { primary: MAROON, secondary: CREAM, accent: YELLOW, text: "#ffffff", textAlt: MAROON },
  tags: ["circle", "duo", "cream"],
  build: (w, h) => {
    const cx = w * 0.5, cy = h * 0.62, r = Math.min(w, h) * 0.32;
    return {
      background: solid(CREAM),
      layers: [
        { ...makeShape({ name: "Dark frame", shape: "rect", x: w * 0.02, y: h * 0.02, width: w * 0.96, height: h * 0.96, fill: { kind: "none" } }), stroke: { enabled: true, width: 10, color: CHARCOAL } },
        circle(cx - r * 0.85, cy - r * 0.85, r * 0.28, solid(YELLOW), "Accent 1"),
        circle(cx + r * 0.75, cy + r * 0.8, r * 0.28, solid(YELLOW), "Accent 2"),
        makeImage({ x: cx - r, y: cy - r, width: r * 2, height: r * 2, mask: "circle", cornerRadius: 0, placeholderLabel: "Add photo" }),
        makeLogo({ x: cx - 48, y: h * 0.05, width: 96, height: 96, mask: "circle" }),
        makeHeading("শিরোনাম", { x: w * 0.06, y: h * 0.16, width: w * 0.88, height: h * 0.12, fill: MAROON, fontSize: 66 }),
      ],
    };
  },
};

export const BD_FRAMES: TemplateDef[] = [
  tornPaperTrio, dashedFrameRed, circleSpotlight, crumpledPoster, channelHero,
  breakingSlant, newsBarClassic, darkTornYellow, circleDuo,
];
