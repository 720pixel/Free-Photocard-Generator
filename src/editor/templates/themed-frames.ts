import { makeHeading, makeImage, makeLogo, makeShape, makeText, solid, linear } from "../factories";
import { band, circle, dashedRing, slantBand } from "./helpers";
import type { Fill, ImageLayer } from "../types";
import type { TemplateDef } from "./types";

// Radial / conic fills (factories only ship `linear`, so build these literally).
function radial(stops: { color: string; offset: number }[]): Fill {
  return { kind: "gradient", gradient: { type: "radial", angle: 0, stops } };
}
function conic(angle: number, stops: { color: string; offset: number }[]): Fill {
  return { kind: "gradient", gradient: { type: "conic", angle, stops } };
}

// Full-bleed cover photo the template art draws over (see bd-frames fillPhoto).
function fillPhoto(x: number, y: number, w: number, h: number, extra: Partial<ImageLayer> = {}): ImageLayer {
  return makeImage({
    x, y, width: w, height: h, mask: "rect", cornerRadius: 0, fit: "cover",
    placeholderLabel: "Add photo", ...extra,
  });
}

// ---------------------------------------------------------------------------
// 1. Sports Score — navy + electric cyan, bold diagonal stripes, center score zone.
// ---------------------------------------------------------------------------
const NAVY = "#0b1f4d";
const NAVY_DEEP = "#060f2e";
const ELECTRIC = "#12e0ff";
const LIME = "#c6ff2e";

const sportsScore: TemplateDef = {
  id: "themed-sports-score",
  name: "Sports Score",
  nameBn: "আজকের খেলা",
  category: "Sports",
  palette: { primary: NAVY, secondary: ELECTRIC, accent: LIME, text: "#ffffff", textAlt: NAVY },
  tags: ["sports", "score", "diagonal", "navy"],
  build: (w, h) => ({
    background: linear(150, [
      { color: NAVY_DEEP, offset: 0 },
      { color: NAVY, offset: 0.6 },
      { color: "#123a86", offset: 1 },
    ]),
    layers: [
      // photo fills the top action zone, stripes cut across it
      fillPhoto(0, 0, w, h * 0.5, { overlay: { fill: solid(NAVY_DEEP), blend: "multiply", opacity: 0.28 } }),
      // diagonal energy stripes over the photo edge
      slantBand(-w * 0.25, h * 0.4, w * 1.6, h * 0.05, solid(ELECTRIC), -14, "Cyan stripe"),
      slantBand(-w * 0.25, h * 0.47, w * 1.6, h * 0.02, solid(LIME), -14, "Lime stripe"),
      slantBand(-w * 0.25, h * 0.5, w * 1.6, h * 0.16, solid(NAVY_DEEP), -14, "Score band"),
      // center score / headline zone
      makeHeading("আজকের খেলা", {
        x: w * 0.06, y: h * 0.5, width: w * 0.88, height: h * 0.16,
        fill: ELECTRIC, fontSize: 82, fontWeight: 800, align: "center",
        rotation: -14, letterSpacing: 1,
      }),
      makeText({
        role: "subheading", name: "Score", text: "২ - ১",
        x: w * 0.2, y: h * 0.7, width: w * 0.6, height: h * 0.14,
        fontSize: 96, fontWeight: 800, fill: "#ffffff", align: "center", bengaliDigits: true,
      }),
      makeText({
        role: "date", name: "Match info", text: "ফাইনাল · ঢাকা স্টেডিয়াম",
        x: w * 0.1, y: h * 0.87, width: w * 0.8, height: h * 0.07,
        fontSize: 34, fontWeight: 600, fill: LIME, align: "center",
      }),
      makeLogo({ x: w * 0.05, y: h * 0.04, width: 96, height: 96, mask: "circle", placeholderLabel: "Logo" }),
    ],
  }),
};

// ---------------------------------------------------------------------------
// 2. Eid Greeting — deep green + gold, crescent moon, ornate centered heading.
// ---------------------------------------------------------------------------
const EID_GREEN = "#0d3b2e";
const EID_GREEN_DEEP = "#06251c";
const GOLD = "#e3b23c";
const GOLD_LT = "#f6d98a";

const eidGreeting: TemplateDef = {
  id: "themed-eid",
  name: "Eid Greeting",
  nameBn: "ঈদ মোবারক",
  category: "Religious",
  palette: { primary: EID_GREEN, secondary: GOLD, accent: GOLD_LT, text: "#ffffff", textAlt: GOLD },
  tags: ["eid", "religious", "gold", "crescent"],
  build: (w, h) => {
    const cx = w * 0.5, cy = h * 0.32, r = Math.min(w, h) * 0.13;
    return {
      background: radial([
        { color: "#12523f", offset: 0 },
        { color: EID_GREEN, offset: 0.55 },
        { color: EID_GREEN_DEEP, offset: 1 },
      ]),
      layers: [
        // ornamental gold border
        {
          ...makeShape({ name: "Gold border", shape: "rect", x: w * 0.035, y: h * 0.03, width: w * 0.93, height: h * 0.94, fill: { kind: "none" } }),
          stroke: { enabled: true, width: 3, color: GOLD },
        },
        {
          ...makeShape({ name: "Inner border", shape: "rect", x: w * 0.055, y: h * 0.048, width: w * 0.89, height: h * 0.904, fill: { kind: "none" } }),
          stroke: { enabled: true, width: 1, color: GOLD_LT },
          dash: [4, 6],
        },
        // crescent moon: gold disc with a green disc offset to carve the crescent
        circle(cx, cy, r, solid(GOLD), "Moon disc"),
        circle(cx + r * 0.42, cy - r * 0.18, r * 0.92, radial([{ color: "#12523f", offset: 0 }, { color: EID_GREEN, offset: 1 }]), "Moon carve"),
        // small decorative star
        circle(cx + r * 1.35, cy - r * 0.5, r * 0.12, solid(GOLD_LT), "Star"),
        makeHeading("ঈদ মোবারক", {
          x: w * 0.08, y: h * 0.52, width: w * 0.84, height: h * 0.16,
          fill: GOLD_LT, fontSize: 92, fontWeight: 800, align: "center",
        }),
        makeText({
          role: "subheading", name: "Blessing", text: "ঈদের শুভেচ্ছা রইলো",
          x: w * 0.1, y: h * 0.68, width: w * 0.8, height: h * 0.07,
          fontSize: 38, fontWeight: 600, fill: "#ffffff", align: "center",
        }),
        // photo slot framed in gold ring near bottom
        makeImage({
          x: cx - Math.min(w, h) * 0.18, y: h * 0.75, width: Math.min(w, h) * 0.36, height: Math.min(w, h) * 0.2,
          mask: "rounded", cornerRadius: 20, placeholderLabel: "Add photo",
          stroke: { enabled: true, width: 3, color: GOLD },
        }),
        makeLogo({ x: w * 0.06, y: h * 0.05, width: 84, height: 84, mask: "circle", placeholderLabel: "Logo" }),
      ],
    };
  },
};

// ---------------------------------------------------------------------------
// 3. Tribute — muted respectful greys, black ribbon corner, framed circular photo.
// ---------------------------------------------------------------------------
const TRIB_BG = "#e9e7e2";
const TRIB_DARK = "#1c1c1e";
const TRIB_GREY = "#6b6b70";
const SERIF = "Noto Serif Bengali";

const tribute: TemplateDef = {
  id: "themed-tribute",
  name: "Tribute",
  nameBn: "শ্রদ্ধাঞ্জলি",
  category: "Tribute",
  palette: { primary: TRIB_DARK, secondary: TRIB_BG, accent: TRIB_GREY, text: TRIB_DARK, textAlt: "#ffffff" },
  tags: ["tribute", "memoriam", "ribbon", "respectful"],
  build: (w, h) => {
    const cx = w * 0.5, cy = h * 0.42, r = Math.min(w, h) * 0.24;
    return {
      background: linear(160, [{ color: "#f2f0ec", offset: 0 }, { color: TRIB_BG, offset: 1 }]),
      layers: [
        // thin dark frame
        {
          ...makeShape({ name: "Frame", shape: "rect", x: w * 0.04, y: h * 0.035, width: w * 0.92, height: h * 0.93, fill: { kind: "none" } }),
          stroke: { enabled: true, width: 2, color: TRIB_DARK },
        },
        // black mourning ribbon across the top-left corner
        slantBand(-w * 0.12, h * 0.02, w * 0.42, h * 0.045, solid(TRIB_DARK), -45, "Black ribbon"),
        // circular framed photo
        circle(cx, cy, r * 1.08, solid(TRIB_DARK), "Photo ring"),
        makeImage({
          x: cx - r, y: cy - r, width: r * 2, height: r * 2,
          mask: "circle", cornerRadius: 0, placeholderLabel: "Add photo",
          adjustments: { brightness: 0, contrast: 5, saturation: -1.4, hue: 0, blur: 0 },
        }),
        makeHeading("শ্রদ্ধাঞ্জলি", {
          x: w * 0.08, y: h * 0.7, width: w * 0.84, height: h * 0.12,
          fill: TRIB_DARK, fontFamily: SERIF, fontSize: 80, fontWeight: 700, align: "center",
        }),
        makeText({
          role: "subheading", name: "In memoriam", text: "গভীর শ্রদ্ধার সাথে স্মরণ",
          x: w * 0.1, y: h * 0.82, width: w * 0.8, height: h * 0.06,
          fontFamily: SERIF, fontSize: 34, fontWeight: 500, fill: TRIB_GREY, align: "center",
        }),
        makeText({
          role: "date", name: "Dates", text: "১৯৪৫ — ২০২৬",
          x: w * 0.1, y: h * 0.89, width: w * 0.8, height: h * 0.05,
          fontSize: 30, fontWeight: 600, fill: TRIB_DARK, align: "center", bengaliDigits: true,
        }),
        makeLogo({ x: w * 0.87, y: h * 0.05, width: 76, height: 76, mask: "rect", placeholderLabel: "Logo" }),
      ],
    };
  },
};

// ---------------------------------------------------------------------------
// 4. Notice Board — clipboard look, structured header bar, stamp accent.
// ---------------------------------------------------------------------------
const NOTICE_BG = "#f5f1e6";
const NOTICE_INK = "#233044";
const NOTICE_RED = "#b3241f";

const noticeBoard: TemplateDef = {
  id: "themed-notice",
  name: "Notice Board",
  nameBn: "জরুরি বিজ্ঞপ্তি",
  category: "Notice",
  palette: { primary: NOTICE_INK, secondary: NOTICE_BG, accent: NOTICE_RED, text: "#ffffff", textAlt: NOTICE_INK },
  tags: ["notice", "announcement", "clipboard", "stamp"],
  build: (w, h) => {
    const barH = h * 0.16;
    const stampR = Math.min(w, h) * 0.11;
    return {
      background: solid("#d9d3c4"),
      layers: [
        // paper sheet
        band(w * 0.05, h * 0.05, w * 0.9, h * 0.9, solid(NOTICE_BG), "Paper"),
        {
          ...makeShape({ name: "Paper edge", shape: "rect", x: w * 0.05, y: h * 0.05, width: w * 0.9, height: h * 0.9, fill: { kind: "none" } }),
          stroke: { enabled: true, width: 2, color: NOTICE_INK },
        },
        // clip at top center
        band(w * 0.44, h * 0.02, w * 0.12, h * 0.05, solid(NOTICE_INK), "Clip"),
        // structured header bar
        band(w * 0.05, h * 0.08, w * 0.9, barH, solid(NOTICE_INK), "Header bar"),
        band(w * 0.05, h * 0.08 + barH, w * 0.9, h * 0.006, solid(NOTICE_RED), "Header rule"),
        makeText({
          role: "subheading", name: "Kicker", text: "বিজ্ঞপ্তি",
          x: w * 0.08, y: h * 0.095, width: w * 0.5, height: h * 0.05,
          fontSize: 32, fontWeight: 700, fill: NOTICE_RED, align: "left", letterSpacing: 2,
        }),
        makeHeading("জরুরি বিজ্ঞপ্তি", {
          x: w * 0.07, y: h * 0.135, width: w * 0.7, height: h * 0.08,
          fill: "#ffffff", fontSize: 60, fontWeight: 800, align: "left",
        }),
        // photo slot
        makeImage({
          x: w * 0.1, y: h * 0.3, width: w * 0.8, height: h * 0.42,
          mask: "rounded", cornerRadius: 12, placeholderLabel: "Add photo",
          stroke: { enabled: true, width: 2, color: NOTICE_INK },
        }),
        // date line
        makeText({
          role: "date", name: "Date", text: "তারিখ: ০৫ জুলাই ২০২৬",
          x: w * 0.1, y: h * 0.76, width: w * 0.6, height: h * 0.06,
          fontSize: 34, fontWeight: 600, fill: NOTICE_INK, align: "left", bengaliDigits: true,
        }),
        // stamp-like circle accent
        dashedRing(w * 0.78, h * 0.82, stampR, NOTICE_RED, [8, 6]),
        circle(w * 0.78, h * 0.82, stampR * 0.72, { kind: "none" }, "Stamp inner"),
        makeText({
          role: "footer", name: "Stamp text", text: "অনুমোদিত",
          x: w * 0.78 - stampR, y: h * 0.82 - stampR * 0.28, width: stampR * 2, height: stampR * 0.56,
          fontSize: 24, fontWeight: 700, fill: NOTICE_RED, align: "center",
        }),
        makeLogo({ x: w * 0.83, y: h * 0.095, width: 72, height: 72, mask: "rect", placeholderLabel: "Logo" }),
      ],
    };
  },
};

// ---------------------------------------------------------------------------
// 5. Weather Alert — gradient storm sky, big temp/heading, location line.
// ---------------------------------------------------------------------------
const SKY_TOP = "#1b3a63";
const SKY_MID = "#3f6fa3";
const SKY_STORM = "#0d1c33";
const WEATHER_AMBER = "#ffce3a";

const weatherAlert: TemplateDef = {
  id: "themed-weather",
  name: "Weather Alert",
  nameBn: "আবহাওয়ার সতর্কতা",
  category: "Weather",
  palette: { primary: SKY_TOP, secondary: SKY_MID, accent: WEATHER_AMBER, text: "#ffffff", textAlt: SKY_STORM },
  tags: ["weather", "alert", "sky", "storm"],
  build: (w, h) => ({
    background: linear(180, [
      { color: SKY_STORM, offset: 0 },
      { color: SKY_TOP, offset: 0.5 },
      { color: SKY_MID, offset: 1 },
    ]),
    layers: [
      // photo scene fills bottom half (sky / scene), darkened for text
      fillPhoto(0, h * 0.5, w, h * 0.5, { overlay: { fill: solid(SKY_STORM), blend: "multiply", opacity: 0.35 } }),
      // amber alert stripe
      band(0, h * 0.44, w, h * 0.012, solid(WEATHER_AMBER), "Alert stripe"),
      // alert kicker chip
      band(w * 0.06, h * 0.06, w * 0.5, h * 0.06, solid(WEATHER_AMBER), "Alert chip"),
      makeText({
        role: "subheading", name: "Alert", text: "সতর্কতা জারি",
        x: w * 0.06, y: h * 0.068, width: w * 0.5, height: h * 0.045,
        fontSize: 32, fontWeight: 800, fill: SKY_STORM, align: "center", letterSpacing: 1,
      }),
      // big temperature
      makeText({
        role: "subheading", name: "Temperature", text: "৩৮°",
        x: w * 0.06, y: h * 0.15, width: w * 0.88, height: h * 0.16,
        fontSize: 120, fontWeight: 800, fill: WEATHER_AMBER, align: "center", bengaliDigits: true,
      }),
      makeHeading("আবহাওয়ার সতর্কতা", {
        x: w * 0.06, y: h * 0.32, width: w * 0.88, height: h * 0.1,
        fill: "#ffffff", fontSize: 66, fontWeight: 800, align: "center",
      }),
      // location / date line over the photo
      makeText({
        role: "date", name: "Location", text: "ঢাকা · ০৫ জুলাই ২০২৬",
        x: w * 0.06, y: h * 0.88, width: w * 0.88, height: h * 0.07,
        fontSize: 36, fontWeight: 600, fill: "#ffffff", align: "center", bengaliDigits: true,
      }),
      makeLogo({ x: w * 0.82, y: h * 0.05, width: 88, height: 88, mask: "circle", placeholderLabel: "Logo" }),
    ],
  }),
};

// ---------------------------------------------------------------------------
// 6. Election Poll — two-column comparison, center divider, progress bars.
// ---------------------------------------------------------------------------
const POLL_BG = "#0f1626";
const POLL_BLUE = "#2f6fed";
const POLL_ORANGE = "#f5642e";
const POLL_LT = "#eef2f8";

const electionPoll: TemplateDef = {
  id: "themed-election",
  name: "Election Poll",
  nameBn: "জনমত জরিপ",
  category: "General",
  palette: { primary: POLL_BLUE, secondary: POLL_ORANGE, accent: POLL_LT, text: "#ffffff", textAlt: POLL_BG },
  tags: ["election", "poll", "comparison", "bars"],
  build: (w, h) => {
    const barY = h * 0.66;
    const barH = h * 0.05;
    return {
      background: linear(160, [{ color: POLL_BG, offset: 0 }, { color: "#1a2740", offset: 1 }]),
      layers: [
        // two color columns
        slantBand(-w * 0.05, -h * 0.05, w * 0.62, h * 1.1, solid(POLL_BLUE), 6, "Blue column"),
        slantBand(w * 0.55, -h * 0.05, w * 0.6, h * 1.1, solid(POLL_ORANGE), 6, "Orange column"),
        // center divider
        band(w * 0.49, 0, w * 0.02, h, solid(POLL_LT), "Divider"),
        // photo slot spanning center top
        makeImage({
          x: w * 0.18, y: h * 0.14, width: w * 0.64, height: h * 0.4,
          mask: "rounded", cornerRadius: 16, placeholderLabel: "Add photo",
          stroke: { enabled: true, width: 4, color: POLL_LT },
        }),
        makeHeading("জনমত জরিপ", {
          x: w * 0.08, y: h * 0.03, width: w * 0.84, height: h * 0.1,
          fill: "#ffffff", fontSize: 72, fontWeight: 800, align: "center",
          stroke: { enabled: true, width: 3, color: POLL_BG },
        }),
        // progress-bar-like decorations
        band(w * 0.1, barY, w * 0.8, barH, solid("#25304a"), "Bar A track"),
        band(w * 0.1, barY, w * 0.8 * 0.58, barH, solid(POLL_BLUE), "Bar A fill"),
        band(w * 0.1, barY + barH * 1.6, w * 0.8, barH, solid("#25304a"), "Bar B track"),
        band(w * 0.1, barY + barH * 1.6, w * 0.8 * 0.42, barH, solid(POLL_ORANGE), "Bar B fill"),
        makeText({
          role: "subheading", name: "Result A", text: "প্রার্থী ক · ৫৮%",
          x: w * 0.1, y: barY - h * 0.045, width: w * 0.8, height: h * 0.04,
          fontSize: 30, fontWeight: 700, fill: "#ffffff", align: "left", bengaliDigits: true,
        }),
        makeText({
          role: "date", name: "Result B", text: "প্রার্থী খ · ৪২%",
          x: w * 0.1, y: barY + barH * 1.6 - h * 0.045, width: w * 0.8, height: h * 0.04,
          fontSize: 30, fontWeight: 700, fill: "#ffffff", align: "left", bengaliDigits: true,
        }),
        makeLogo({ x: w * 0.05, y: h * 0.9, width: 80, height: 80, mask: "rect", placeholderLabel: "Logo" }),
      ],
    };
  },
};

// ---------------------------------------------------------------------------
// 7. Entertainment Spotlight — glamorous marquee, spotlight radial, portrait.
// ---------------------------------------------------------------------------
const ENT_BG = "#150a24";
const ENT_MAGENTA = "#ff2e88";
const ENT_GOLD = "#ffd24a";
const ENT_PURPLE = "#7b2ff7";

const entertainmentSpotlight: TemplateDef = {
  id: "themed-entertainment",
  name: "Entertainment Spotlight",
  nameBn: "বিনোদন স্পটলাইট",
  category: "Entertainment",
  palette: { primary: ENT_PURPLE, secondary: ENT_MAGENTA, accent: ENT_GOLD, text: "#ffffff", textAlt: ENT_BG },
  tags: ["entertainment", "glamour", "spotlight", "marquee"],
  build: (w, h) => {
    const cx = w * 0.5, cy = h * 0.4;
    return {
      background: radial([
        { color: "#3a1866", offset: 0 },
        { color: "#1e0d38", offset: 0.55 },
        { color: ENT_BG, offset: 1 },
      ]),
      layers: [
        // spotlight cone glow
        circle(cx, cy, Math.min(w, h) * 0.5, radial([
          { color: "rgba(255,210,74,0.35)", offset: 0 },
          { color: "rgba(255,210,74,0)", offset: 1 },
        ]), "Spotlight glow"),
        // marquee dotted ring
        dashedRing(cx, cy, Math.min(w, h) * 0.31, ENT_GOLD, [6, 10]),
        // portrait photo (circular)
        makeImage({
          x: cx - Math.min(w, h) * 0.27, y: cy - Math.min(w, h) * 0.27,
          width: Math.min(w, h) * 0.54, height: Math.min(w, h) * 0.54,
          mask: "circle", cornerRadius: 0, placeholderLabel: "Add photo",
          stroke: { enabled: true, width: 4, color: ENT_MAGENTA },
        }),
        // bottom marquee bar
        band(0, h * 0.72, w, h * 0.02, linear(90, [{ color: ENT_MAGENTA, offset: 0 }, { color: ENT_PURPLE, offset: 1 }]), "Marquee rule"),
        makeHeading("বিনোদন স্পটলাইট", {
          x: w * 0.06, y: h * 0.76, width: w * 0.88, height: h * 0.12,
          fill: ENT_GOLD, fontSize: 74, fontWeight: 800, align: "center",
          shadow: { enabled: true, x: 0, y: 4, blur: 18, color: ENT_MAGENTA, opacity: 0.6 },
        }),
        makeText({
          role: "subheading", name: "Tagline", text: "আজ রাতে · বড় পর্দায়",
          x: w * 0.1, y: h * 0.89, width: w * 0.8, height: h * 0.06,
          fontSize: 34, fontWeight: 600, fill: "#ffffff", align: "center",
        }),
        makeLogo({ x: w * 0.06, y: h * 0.05, width: 88, height: 88, mask: "circle", placeholderLabel: "Logo" }),
      ],
    };
  },
};

// ---------------------------------------------------------------------------
// 8. Quote Spotlight — giant quotation marks, centered quote, attribution photo.
// ---------------------------------------------------------------------------
const QUOTE_BG = "#faf6ef";
const QUOTE_INK = "#20242b";
const QUOTE_TEAL = "#0d8a7a";
const QUOTE_CORAL = "#e8603c";

const quoteSpotlight: TemplateDef = {
  id: "themed-quote-spotlight",
  name: "Quote Spotlight",
  nameBn: "উক্তি",
  category: "General",
  palette: { primary: QUOTE_TEAL, secondary: QUOTE_CORAL, accent: QUOTE_INK, text: QUOTE_INK, textAlt: "#ffffff" },
  tags: ["quote", "typography", "spotlight", "editorial"],
  build: (w, h) => {
    const attrR = Math.min(w, h) * 0.09;
    return {
      background: linear(160, [{ color: "#ffffff", offset: 0 }, { color: QUOTE_BG, offset: 1 }]),
      layers: [
        // top color rule
        band(0, 0, w, h * 0.015, linear(90, [{ color: QUOTE_TEAL, offset: 0 }, { color: QUOTE_CORAL, offset: 1 }]), "Top rule"),
        // giant opening quote mark
        makeText({
          role: "custom", name: "Quote open", text: "“",
          x: w * 0.04, y: h * 0.08, width: w * 0.4, height: h * 0.32,
          fontFamily: "Noto Serif Bengali", fontSize: 260, fontWeight: 800,
          fill: QUOTE_TEAL, align: "left", autoFit: false, opacity: 0.9,
        }),
        // giant closing quote mark
        makeText({
          role: "custom", name: "Quote close", text: "”",
          x: w * 0.56, y: h * 0.5, width: w * 0.4, height: h * 0.32,
          fontFamily: "Noto Serif Bengali", fontSize: 260, fontWeight: 800,
          fill: QUOTE_CORAL, align: "right", autoFit: false, opacity: 0.9,
        }),
        // centered quote heading
        makeHeading("যে পড়ে, সে এগিয়ে যায়", {
          x: w * 0.12, y: h * 0.33, width: w * 0.76, height: h * 0.28,
          fill: QUOTE_INK, fontSize: 62, fontWeight: 700, align: "center", lineHeight: 1.3,
        }),
        // small circular attribution photo
        circle(w * 0.5, h * 0.72, attrR * 1.08, solid(QUOTE_TEAL), "Attr ring"),
        makeImage({
          x: w * 0.5 - attrR, y: h * 0.72 - attrR, width: attrR * 2, height: attrR * 2,
          mask: "circle", cornerRadius: 0, placeholderLabel: "Add photo",
        }),
        makeText({
          role: "subheading", name: "Attribution", text: "— লেখকের নাম",
          x: w * 0.1, y: h * 0.82, width: w * 0.8, height: h * 0.06,
          fontSize: 36, fontWeight: 700, fill: QUOTE_CORAL, align: "center",
        }),
        makeLogo({ x: w * 0.06, y: h * 0.9, width: 76, height: 76, mask: "rect", placeholderLabel: "Logo" }),
      ],
    };
  },
};

export const THEMED_FRAMES: TemplateDef[] = [
  sportsScore,
  eidGreeting,
  tribute,
  noticeBoard,
  weatherAlert,
  electionPoll,
  entertainmentSpotlight,
  quoteSpotlight,
];
