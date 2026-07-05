import { makeHeading, makeImage, makeLogo, makeText, makeShape, solid, linear } from "../factories";
import { band, circle } from "./helpers";
import type { TextLayer } from "../types";
import type { TemplateDef } from "./types";

// Recreations of 15 HTML/CSS news photocard reference templates.
// Every template exposes: one photo slot, one logo slot, one heading,
// plus (where the source has them) date / site / subheading text roles.
// Positions are fractions of w/h so a template works at any preset size.

const SAMPLE_SUB = "আজকের গুরুত্বপূর্ণ সব খবর, এক নজরে দেখে নিন।";
const SAMPLE_HEAD = "আপনার শিরোনাম এখানে লিখুন";
const SHADE_DOWN = linear(0, [
  { color: "rgba(0,0,0,0)", offset: 0 },
  { color: "rgba(0,0,0,0.85)", offset: 1 },
]);

function dateText(text: string, o: Partial<TextLayer> = {}): TextLayer {
  return makeText({
    role: "date",
    name: "Date",
    text,
    fontSize: 24,
    fontWeight: 600,
    align: "left",
    autoFit: true,
    bengaliDigits: true,
    height: 44,
    ...o,
  });
}

function siteText(text: string, o: Partial<TextLayer> = {}): TextLayer {
  return makeText({
    role: "site",
    name: "Site",
    text,
    fontSize: 24,
    fontWeight: 600,
    align: "left",
    autoFit: true,
    height: 44,
    ...o,
  });
}

function subText(text: string, o: Partial<TextLayer> = {}): TextLayer {
  return makeText({
    role: "subheading",
    name: "Subheading",
    text,
    fontSize: 32,
    fontWeight: 500,
    align: "left",
    lineHeight: 1.4,
    autoFit: true,
    ...o,
  });
}

// 1. Classic Newspaper
const classic: TemplateDef = {
  id: "am-classic",
  name: "Classic Newspaper",
  nameBn: "ক্লাসিক সংবাদপত্র",
  category: "Newspaper",
  palette: { primary: "#D9232D", secondary: "#ffffff", accent: "#D9232D", text: "#111827", textAlt: "#ffffff" },
  tags: ["classic", "newspaper", "red"],
  build: (w, h) => {
    const photoH = h * 0.6;
    const barY = photoH;
    return {
      background: solid("#ffffff"),
      layers: [
        makeImage({ x: 0, y: 0, width: w, height: photoH, mask: "rect", cornerRadius: 0 }),
        band(0, photoH * 0.62, w, photoH * 0.38, SHADE_DOWN, "Photo shade"),
        subText(SAMPLE_SUB, {
          x: w * 0.046,
          y: photoH - h * 0.09,
          width: w * 0.9,
          height: h * 0.07,
          fill: "#ffffff",
          fontWeight: 500,
        }),
        band(0, barY, w, 8, solid("#D9232D"), "Accent bar"),
        makeHeading("সন্ধ্যার সংবাদ", {
          x: w * 0.046,
          y: barY + h * 0.05,
          width: w * 0.908,
          height: h * 0.16,
          fill: "#111827",
          fontSize: 64,
          fontWeight: 700,
          align: "center",
        }),
        dateText("২৭ ডিসেম্বর ২০২৫", {
          x: w * 0.046,
          y: h * 0.9,
          width: w * 0.3,
          fill: "#111827",
          align: "left",
        }),
        {
          ...makeLogo({
            x: w / 2 - 70,
            y: h * 0.83,
            width: 140,
            height: 140,
            mask: "circle",
            fit: "contain",
          }),
          stroke: { enabled: true, width: 4, color: "#D9232D" },
        },
        siteText("example.com", {
          x: w * 0.65,
          y: h * 0.9,
          width: w * 0.3,
          fill: "#111827",
          align: "right",
        }),
      ],
    };
  },
};

// 2. Modern Bold
const modern: TemplateDef = {
  id: "am-modern",
  name: "Modern Bold",
  nameBn: "মডার্ন বোল্ড",
  category: "Newspaper",
  palette: { primary: "#2563eb", secondary: "#ffffff", accent: "#2563eb", text: "#1f2937", textAlt: "#ffffff" },
  tags: ["modern", "bold", "blue"],
  build: (w, h) => {
    const photoH = h * 0.52;
    return {
      background: solid("#ffffff"),
      layers: [
        makeImage({ x: 0, y: 0, width: w, height: photoH, mask: "rect", cornerRadius: 0 }),
        {
          ...makeShape({
            name: "Logo badge",
            shape: "rounded",
            x: 40,
            y: 40,
            width: 108,
            height: 108,
            fill: solid("#ffffff"),
            cornerRadius: 12,
          }),
        },
        makeLogo({ x: 48, y: 48, width: 92, height: 92, mask: "rounded", cornerRadius: 10, fit: "contain" }),
        dateText("২৭ ডিসেম্বর ২০২৫", {
          x: w * 0.056,
          y: photoH + h * 0.05,
          width: w * 0.6,
          fill: "#2563eb",
          fontWeight: 700,
          letterSpacing: 1,
        }),
        makeHeading(SAMPLE_HEAD, {
          x: w * 0.056,
          y: photoH + h * 0.1,
          width: w * 0.888,
          height: h * 0.2,
          fill: "#1f2937",
          fontSize: 72,
          fontWeight: 800,
          align: "left",
        }),
        subText(SAMPLE_SUB, {
          x: w * 0.056,
          y: photoH + h * 0.32,
          width: w * 0.888,
          height: h * 0.1,
          fill: "#1f2937",
        }),
        makeShape({
          name: "CTA pill",
          shape: "rounded",
          x: w * 0.056,
          y: h * 0.9,
          width: w * 0.36,
          height: h * 0.06,
          fill: solid("#2563eb"),
          cornerRadius: 40,
        }),
        siteText("বিস্তারিত পড়ুন", {
          x: w * 0.056,
          y: h * 0.905,
          width: w * 0.36,
          height: h * 0.05,
          fill: "#ffffff",
          align: "center",
          fontWeight: 600,
        }),
      ],
    };
  },
};

// 3. Breaking News
const breaking: TemplateDef = {
  id: "am-breaking",
  name: "Breaking News",
  nameBn: "ব্রেকিং নিউজ",
  category: "Breaking News",
  palette: { primary: "#dc2626", secondary: "#111111", accent: "#dc2626", text: "#ffffff", textAlt: "#dc2626" },
  tags: ["breaking", "red", "alert"],
  build: (w, h) => {
    const headerH = h * 0.074;
    const tickerH = h * 0.055;
    const textH = h * 0.3;
    const imgY = headerH;
    const imgH = h - headerH - tickerH - textH;
    return {
      background: solid("#111111"),
      layers: [
        band(0, 0, w, headerH, solid("#dc2626"), "Header strip"),
        siteText("BREAKING NEWS", {
          x: w * 0.037,
          y: headerH * 0.28,
          width: w * 0.5,
          height: headerH * 0.5,
          fill: "#ffffff",
          fontWeight: 800,
          fontSize: 32,
          align: "left",
        }),
        circle(w * 0.42, headerH * 0.5, 8, solid("#ffffff"), "Live dot"),
        dateText("২৭ ডিসেম্বর ২০২৫", {
          x: w * 0.6,
          y: headerH * 0.28,
          width: w * 0.36,
          height: headerH * 0.5,
          fill: "#ffffff",
          align: "right",
        }),
        makeImage({ x: 0, y: imgY, width: w, height: imgH, mask: "rect", cornerRadius: 0 }),
        {
          ...makeShape({
            name: "Logo bg",
            shape: "rounded",
            x: w - 148,
            y: imgY + 30,
            width: 118,
            height: 118,
            fill: solid("#ffffff"),
            cornerRadius: 10,
          }),
        },
        makeLogo({ x: w - 142, y: imgY + 36, width: 106, height: 106, mask: "rounded", cornerRadius: 8, fit: "contain" }),
        makeHeading(SAMPLE_HEAD, {
          x: w * 0.046,
          y: imgY + imgH + h * 0.04,
          width: w * 0.908,
          height: h * 0.12,
          fill: "#ffffff",
          fontSize: 64,
          fontWeight: 800,
          align: "left",
        }),
        band(w * 0.046, imgY + imgH + h * 0.17, w * 0.09, 6, solid("#dc2626"), "Divider"),
        subText(SAMPLE_SUB, {
          x: w * 0.046,
          y: imgY + imgH + h * 0.2,
          width: w * 0.908,
          height: h * 0.08,
          fill: "#ffffff",
        }),
        band(0, h - tickerH, w, tickerH, solid("#dc2626"), "Ticker"),
        siteText("LIVE UPDATE • STAY TUNED FOR MORE DETAILS •", {
          x: w * 0.037,
          y: h - tickerH * 0.72,
          width: w * 0.92,
          height: tickerH * 0.6,
          fill: "#ffffff",
          fontWeight: 700,
          align: "left",
        }),
      ],
    };
  },
};

// 4. Quote Card
const quote: TemplateDef = {
  id: "am-quote",
  name: "Quote Card",
  nameBn: "উক্তি কার্ড",
  category: "Quote",
  palette: { primary: "#f59e0b", secondary: "#000000", accent: "#f59e0b", text: "#ffffff", textAlt: "#f59e0b" },
  tags: ["quote", "statement", "amber"],
  build: (w, h) => {
    const footerY = h * 0.9;
    return {
      background: solid("#000000"),
      layers: [
        makeImage({ x: 0, y: 0, width: w, height: h, mask: "rect", cornerRadius: 0 }),
        band(0, 0, w, h, solid("rgba(0,0,0,0.6)"), "Dark overlay"),
        siteText("“", {
          x: w * 0.09,
          y: h * 0.24,
          width: w * 0.3,
          height: h * 0.18,
          fill: "#f59e0b",
          fontSize: 200,
          fontWeight: 700,
          align: "left",
        }),
        makeHeading(SAMPLE_HEAD, {
          x: w * 0.09,
          y: h * 0.42,
          width: w * 0.82,
          height: h * 0.22,
          fill: "#ffffff",
          fontSize: 64,
          fontWeight: 700,
          align: "left",
          lineHeight: 1.3,
        }),
        band(w * 0.09, h * 0.68, w * 0.055, 4, solid("#f59e0b"), "Author line"),
        subText(SAMPLE_SUB, {
          x: w * 0.17,
          y: h * 0.665,
          width: w * 0.7,
          height: h * 0.06,
          fill: "#ffffff",
        }),
        band(0, footerY, w, h * 0.1, solid("rgba(0,0,0,0.3)"), "Footer bg"),
        makeLogo({ x: w * 0.056, y: footerY + h * 0.02, width: 80, height: 80, mask: "rect", fit: "contain" }),
        dateText("২৭ ডিসেম্বর ২০২৫", {
          x: w * 0.5,
          y: footerY + h * 0.04,
          width: w * 0.44,
          fill: "#ffffff",
          align: "right",
          letterSpacing: 2,
          fontSize: 20,
        }),
      ],
    };
  },
};

// 5. Minimalist
const minimal: TemplateDef = {
  id: "am-minimal",
  name: "Minimalist",
  nameBn: "মিনিমাল",
  category: "Newspaper",
  palette: { primary: "#10b981", secondary: "#ffffff", accent: "#10b981", text: "#111827", textAlt: "#10b981" },
  tags: ["minimal", "clean", "green"],
  build: (w, h) => {
    const pad = w * 0.056;
    const imgH = h * 0.5;
    return {
      background: solid("#ffffff"),
      layers: [
        {
          ...makeImage({ x: pad, y: pad, width: w - pad * 2, height: imgH, mask: "rect", cornerRadius: 0 }),
          stroke: { enabled: true, width: 8, color: "#10b981" },
        },
        makeLogo({ x: w * 0.4, y: imgH + pad + h * 0.02, width: 72, height: 44, mask: "rect", fit: "contain" }),
        dateText("২৭ ডিসেম্বর ২০২৫", {
          x: w * 0.48,
          y: imgH + pad + h * 0.025,
          width: w * 0.2,
          fill: "#111827",
          align: "left",
          fontSize: 20,
        }),
        makeHeading(SAMPLE_HEAD, {
          x: pad,
          y: imgH + pad + h * 0.08,
          width: w - pad * 2,
          height: h * 0.12,
          fill: "#111827",
          fontSize: 56,
          fontWeight: 700,
          align: "center",
        }),
        subText(SAMPLE_SUB, {
          x: w * 0.12,
          y: imgH + pad + h * 0.21,
          width: w * 0.76,
          height: h * 0.1,
          fill: "#111827",
          align: "center",
        }),
        circle(w / 2, h * 0.92, 8, solid("#10b981"), "Accent dot"),
      ],
    };
  },
};

// 6. Feature Card
const feature: TemplateDef = {
  id: "am-feature",
  name: "Feature Card",
  nameBn: "ফিচার কার্ড",
  category: "Newspaper",
  palette: { primary: "#8b5cf6", secondary: "#ffffff", accent: "#8b5cf6", text: "#1f2937", textAlt: "#ffffff" },
  tags: ["feature", "centered", "violet"],
  build: (w, h) => {
    const photoH = h * 0.55;
    const footerH = h * 0.074;
    return {
      background: solid("#ffffff"),
      layers: [
        makeImage({ x: 0, y: 0, width: w, height: photoH, mask: "rect", cornerRadius: 0 }),
        {
          ...makeShape({
            name: "Logo ring",
            shape: "circle",
            x: w / 2 - 74,
            y: photoH - 74,
            width: 148,
            height: 148,
            fill: solid("#ffffff"),
          }),
        },
        makeLogo({ x: w / 2 - 66, y: photoH - 66, width: 132, height: 132, mask: "circle", fit: "contain" }),
        subText(SAMPLE_SUB, {
          x: w * 0.1,
          y: photoH + h * 0.08,
          width: w * 0.8,
          height: h * 0.06,
          fill: "#1f2937",
          align: "center",
        }),
        makeHeading(SAMPLE_HEAD, {
          x: w * 0.056,
          y: photoH + h * 0.15,
          width: w * 0.888,
          height: h * 0.18,
          fill: "#8b5cf6",
          fontSize: 64,
          fontWeight: 700,
          align: "center",
        }),
        band(0, h - footerH, w, footerH, solid("rgba(0,0,0,0.05)"), "Footer strip"),
        dateText("২৭ ডিসেম্বর ২০২৫", {
          x: w * 0.046,
          y: h - footerH * 0.68,
          width: w * 0.4,
          fill: "#6b7280",
          align: "left",
        }),
        siteText("example.com", {
          x: w * 0.54,
          y: h - footerH * 0.68,
          width: w * 0.42,
          fill: "#6b7280",
          align: "right",
        }),
      ],
    };
  },
};

// 7. Classikalo
const classikalo: TemplateDef = {
  id: "am-classikalo",
  name: "Classikalo",
  nameBn: "ক্লাসিকালো",
  category: "Newspaper",
  palette: { primary: "#D9232D", secondary: "#ffffff", accent: "#D9232D", text: "#111827", textAlt: "#ffffff" },
  tags: ["clean", "news", "red"],
  build: (w, h) => {
    const photoH = h * 0.55;
    const pad = w * 0.046;
    return {
      background: solid("#ffffff"),
      layers: [
        makeImage({ x: 0, y: 0, width: w, height: photoH, mask: "rect", cornerRadius: 0 }),
        band(0, photoH, w, 8, solid("#D9232D"), "Accent bar"),
        dateText("২৭ ডিসেম্বর ২০২৫", {
          x: pad,
          y: photoH + h * 0.04,
          width: w * 0.5,
          fill: "#111827",
          align: "left",
        }),
        makeHeading(SAMPLE_HEAD, {
          x: pad,
          y: photoH + h * 0.09,
          width: w * 0.908,
          height: h * 0.14,
          fill: "#111827",
          fontSize: 60,
          fontWeight: 700,
          align: "left",
        }),
        subText(SAMPLE_SUB, {
          x: pad,
          y: photoH + h * 0.25,
          width: w * 0.908,
          height: h * 0.1,
          fill: "#111827",
        }),
        makeLogo({ x: w * 0.78, y: h * 0.9, width: 140, height: 60, mask: "rect", fit: "contain" }),
      ],
    };
  },
};

// 8. BTC News Style (bbc clone)
const bbc: TemplateDef = {
  id: "am-bbc",
  name: "BTC News Style",
  nameBn: "বিটিসি নিউজ স্টাইল",
  category: "TV Channel",
  palette: { primary: "#b80000", secondary: "#ffffff", accent: "#b80000", text: "#111827", textAlt: "#ffffff" },
  tags: ["channel", "red", "news"],
  build: (w, h) => {
    const photoH = h * 0.55;
    const pad = w * 0.046;
    return {
      background: solid("#ffffff"),
      layers: [
        makeImage({ x: 0, y: 0, width: w, height: photoH, mask: "rect", cornerRadius: 0 }),
        band(0, photoH - h * 0.05, w * 0.18, h * 0.05, solid("#b80000"), "Category bg"),
        siteText("NEWS", {
          x: w * 0.02,
          y: photoH - h * 0.045,
          width: w * 0.14,
          height: h * 0.04,
          fill: "#ffffff",
          fontWeight: 700,
          align: "left",
        }),
        makeHeading(SAMPLE_HEAD, {
          x: pad,
          y: photoH + h * 0.045,
          width: w * 0.908,
          height: h * 0.14,
          fill: "#111827",
          fontSize: 64,
          fontWeight: 700,
          align: "left",
        }),
        subText(SAMPLE_SUB, {
          x: pad,
          y: photoH + h * 0.21,
          width: w * 0.908,
          height: h * 0.08,
          fill: "#111827",
        }),
        dateText("২৭ ডিসেম্বর ২০২৫ | example.com", {
          x: pad,
          y: h * 0.88,
          width: w * 0.6,
          fill: "#111827",
          align: "left",
        }),
        makeLogo({ x: w * 0.78, y: h * 0.86, width: 140, height: 50, mask: "rect", fit: "contain" }),
        band(0, h - 8, w, 8, solid("#b80000"), "Bottom accent"),
      ],
    };
  },
};

// 9. NTB Style (ntv clone)
const ntv: TemplateDef = {
  id: "am-ntv",
  name: "NTB Style",
  nameBn: "এনটিবি স্টাইল",
  category: "TV Channel",
  palette: { primary: "#00A651", secondary: "#ffffff", accent: "#00A651", text: "#000000", textAlt: "#ffffff" },
  tags: ["channel", "green", "clean"],
  build: (w, h) => {
    const photoH = h * 0.56;
    const pad = w * 0.046;
    return {
      background: solid("#ffffff"),
      layers: [
        makeImage({ x: 0, y: 0, width: w, height: photoH, mask: "rect", cornerRadius: 0 }),
        {
          ...makeShape({
            name: "Logo badge",
            shape: "circle",
            x: 40,
            y: 40,
            width: 120,
            height: 120,
            fill: solid("#ffffff"),
          }),
          shadow: { enabled: true, x: 0, y: 4, blur: 20, color: "#000000", opacity: 0.15 },
        },
        makeLogo({ x: 48, y: 48, width: 104, height: 104, mask: "circle", fit: "contain" }),
        makeShape({
          name: "Date pill",
          shape: "rounded",
          x: pad,
          y: photoH + h * 0.04,
          width: w * 0.32,
          height: h * 0.05,
          fill: solid("#00A651"),
          cornerRadius: 40,
        }),
        dateText("২৭ ডিসেম্বর ২০২৫", {
          x: pad,
          y: photoH + h * 0.05,
          width: w * 0.32,
          height: h * 0.03,
          fill: "#ffffff",
          align: "center",
        }),
        makeHeading(SAMPLE_HEAD, {
          x: pad,
          y: photoH + h * 0.11,
          width: w * 0.908,
          height: h * 0.14,
          fill: "#000000",
          fontSize: 60,
          fontWeight: 700,
          align: "left",
        }),
        subText(SAMPLE_SUB, {
          x: pad,
          y: photoH + h * 0.27,
          width: w * 0.908,
          height: h * 0.08,
          fill: "#000000",
        }),
        band(0, h - 10, w, 10, linear(0, [
          { color: "#00A651", offset: 0 },
          { color: "#8dc63f", offset: 1 },
        ]), "Bottom bar"),
      ],
    };
  },
};

// 10. BTB Style (btv clone)
const btv: TemplateDef = {
  id: "am-btv",
  name: "BTB Style",
  nameBn: "বিটিবি স্টাইল",
  category: "TV Channel",
  palette: { primary: "#006a4e", secondary: "#ffffff", accent: "#006a4e", text: "#000000", textAlt: "#ffffff" },
  tags: ["channel", "official", "broadcast"],
  build: (w, h) => {
    const m = w * 0.018;
    const headerY = m;
    const headerH = h * 0.09;
    const contentH = h * 0.22;
    const imgY = headerY + headerH + h * 0.02;
    const imgH = h - imgY - contentH - m;
    return {
      background: solid("#ffffff"),
      layers: [
        makeLogo({ x: m + 4, y: headerY + h * 0.01, width: 150, height: 70, mask: "rect", fit: "contain" }),
        dateText("১২ জানুয়ারি ২০২৫", {
          x: w * 0.55,
          y: headerY + h * 0.03,
          width: w * 0.42 - m,
          fill: "#000000",
          align: "right",
        }),
        band(m, headerY + headerH, w - m * 2, 4, solid("#006a4e"), "Header rule"),
        makeImage({ x: m, y: imgY, width: w - m * 2, height: imgH, mask: "rect", cornerRadius: 0 }),
        makeShape({
          name: "Live badge",
          shape: "rounded",
          x: w - m - w * 0.16,
          y: imgY + h * 0.02,
          width: w * 0.14,
          height: h * 0.045,
          fill: solid("#cc0000"),
          cornerRadius: 4,
        }),
        siteText("বিনোদন", {
          x: w - m - w * 0.16,
          y: imgY + h * 0.026,
          width: w * 0.14,
          height: h * 0.035,
          fill: "#ffffff",
          fontWeight: 700,
          align: "center",
        }),
        makeHeading(SAMPLE_HEAD, {
          x: m + 4,
          y: imgY + imgH + h * 0.02,
          width: w - m * 2 - 8,
          height: h * 0.1,
          fill: "#000000",
          fontSize: 56,
          fontWeight: 700,
          align: "left",
        }),
        subText(SAMPLE_SUB, {
          x: m + 4,
          y: imgY + imgH + h * 0.14,
          width: w - m * 2 - 8,
          height: h * 0.07,
          fill: "#000000",
        }),
      ],
    };
  },
};

// 11. Daily Tader Desh (amaderdesh clone)
const amaderdesh: TemplateDef = {
  id: "am-amaderdesh",
  name: "Daily Tader Desh",
  nameBn: "ডেইলি তাদের দেশ",
  category: "TV Channel",
  palette: { primary: "#009958", secondary: "#CDDCD5", accent: "#009958", text: "#1f2937", textAlt: "#ffffff" },
  tags: ["newspaper", "bold", "headline"],
  build: (w, h) => {
    const logoH = h * 0.13;
    const footerH = h * 0.08;
    const imgY = logoH + h * 0.035;
    const imgH = h * 0.4;
    const font = "Noto Serif Bengali";
    return {
      background: solid("#CDDCD5"),
      layers: [
        makeLogo({ x: w / 2 - 130, y: h * 0.02, width: 260, height: logoH, mask: "rect", fit: "contain" }),
        makeImage({ x: w * 0.037, y: imgY, width: w * 0.926, height: imgH, mask: "rect", cornerRadius: 0 }),
        makeHeading(SAMPLE_HEAD, {
          x: w * 0.037,
          y: imgY + imgH + h * 0.03,
          width: w * 0.926,
          height: h * 0.13,
          fill: "#1f2937",
          fontFamily: font,
          fontSize: 68,
          fontWeight: 800,
          align: "center",
        }),
        subText(SAMPLE_SUB, {
          x: w * 0.037,
          y: imgY + imgH + h * 0.17,
          width: w * 0.926,
          height: h * 0.08,
          fill: "#1f2937",
          fontFamily: font,
          align: "center",
        }),
        siteText("বিস্তারিত কমেন্টে", {
          x: w * 0.037,
          y: imgY + imgH + h * 0.26,
          width: w * 0.926,
          height: h * 0.05,
          fill: "#EE1C25",
          fontFamily: font,
          fontWeight: 600,
          align: "center",
        }),
        band(0, h - footerH, w, footerH, solid("#009958"), "Footer bar"),
        band(0, h - 10, w, 10, solid("#EE1C25"), "Footer edge"),
        siteText("example.com", {
          x: w * 0.037,
          y: h - footerH * 0.7,
          width: w * 0.45,
          height: footerH * 0.5,
          fill: "#ffffff",
          fontFamily: font,
          align: "left",
        }),
        dateText("৩২ ডিসেম্বর ২০২৫", {
          x: w * 0.52,
          y: h - footerH * 0.7,
          width: w * 0.44,
          height: footerH * 0.5,
          fill: "#ffffff",
          fontFamily: font,
          align: "right",
        }),
      ],
    };
  },
};

// 12. Semay TV (somoy clone)
const somoy: TemplateDef = {
  id: "am-somoy",
  name: "Semay TV",
  nameBn: "সেমায় টিভি",
  category: "TV Channel",
  palette: { primary: "#BD0706", secondary: "#383838", accent: "#BD0706", text: "#FFFFFF", textAlt: "#BD0706" },
  tags: ["channel", "broadcast", "ticker"],
  build: (w, h) => {
    const b = w * 0.009;
    const font = "Noto Serif Bengali";
    const imgY = b;
    const imgH = h * 0.55;
    const footerH = h * 0.16;
    return {
      background: solid("#383838"),
      layers: [
        band(0, 0, w, b, solid("#BD0706"), "Border top"),
        band(0, h - b, w, b, solid("#BD0706"), "Border bottom"),
        band(0, 0, b, h, solid("#BD0706"), "Border left"),
        band(w - b, 0, b, h, solid("#BD0706"), "Border right"),
        makeImage({ x: b, y: imgY, width: w - b * 2, height: imgH, mask: "rect", cornerRadius: 0 }),
        band(b, imgY + imgH - h * 0.04, w * 0.28, h * 0.04, solid("#BD0706"), "Tag bg"),
        siteText("ব্রেকিং নিউজ", {
          x: b + w * 0.015,
          y: imgY + imgH - h * 0.035,
          width: w * 0.24,
          height: h * 0.03,
          fill: "#ffffff",
          fontFamily: font,
          fontWeight: 700,
          align: "left",
        }),
        band(b, imgY + imgH, w - b * 2, 4, solid("#BD0706"), "Content rule"),
        makeHeading(SAMPLE_HEAD, {
          x: w * 0.046,
          y: imgY + imgH + h * 0.03,
          width: w * 0.908,
          height: h * 0.11,
          fill: "#FFFFFF",
          fontFamily: font,
          fontSize: 60,
          fontWeight: 700,
          align: "center",
        }),
        subText(SAMPLE_SUB, {
          x: w * 0.046,
          y: imgY + imgH + h * 0.15,
          width: w * 0.908,
          height: h * 0.07,
          fill: "#FFFFFF",
          fontFamily: font,
          align: "center",
        }),
        makeLogo({ x: w * 0.05, y: h - footerH, width: 230, height: footerH * 0.8, mask: "rect", fit: "contain" }),
        makeShape({
          name: "More pill",
          shape: "rounded",
          x: w * 0.38,
          y: h - footerH * 0.7,
          width: w * 0.24,
          height: h * 0.06,
          fill: solid("#BD0706"),
          cornerRadius: 10,
        }),
        siteText("বিস্তারিত কমেন্টে", {
          x: w * 0.38,
          y: h - footerH * 0.62,
          width: w * 0.24,
          height: h * 0.045,
          fill: "#ffffff",
          fontFamily: font,
          align: "center",
        }),
        band(w * 0.72, h - footerH * 0.6, w * 0.28 - b, h * 0.04, solid("#BD0706"), "Time bar bg"),
        dateText("৩২ ডিসেম্বর ২০২৫", {
          x: w * 0.72,
          y: h - footerH * 0.55,
          width: w * 0.26,
          height: h * 0.03,
          fill: "#ffffff",
          fontFamily: font,
          fontWeight: 700,
          align: "center",
        }),
      ],
    };
  },
};

// 13. Kamuna TV (jamuna clone)
const jamuna: TemplateDef = {
  id: "am-jamuna",
  name: "Kamuna TV",
  nameBn: "কামুনা টিভি",
  category: "TV Channel",
  palette: { primary: "#9b090d", secondary: "#810004", accent: "#9b090d", text: "#ffffff", textAlt: "#ffffff" },
  tags: ["channel", "maroon", "sleek"],
  build: (w, h) => {
    const footerH = h * 0.069;
    const b = w * 0.009;
    const imgY = b;
    const imgH = h * 0.55;
    const font = "Noto Serif Bengali";
    return {
      background: solid("#9b090d"),
      layers: [
        band(0, 0, w, h - footerH, solid("#9b090d"), "Body bg"),
        makeImage({ x: b, y: imgY, width: w - b * 2, height: imgH, mask: "rect", cornerRadius: 0 }),
        makeHeading(SAMPLE_HEAD, {
          x: w * 0.037,
          y: imgY + imgH + h * 0.03,
          width: w * 0.926,
          height: h * 0.11,
          fill: "#ffffff",
          fontFamily: font,
          fontSize: 56,
          fontWeight: 700,
          align: "center",
        }),
        subText(SAMPLE_SUB, {
          x: w * 0.037,
          y: imgY + imgH + h * 0.15,
          width: w * 0.926,
          height: h * 0.07,
          fill: "#ffffff",
          fontFamily: font,
          align: "center",
        }),
        dateText("২৭ ডিসেম্বর ২০২৫", {
          x: w * 0.55,
          y: imgY + imgH + h * 0.23,
          width: w * 0.408,
          fill: "#ffffff",
          fontFamily: font,
          align: "right",
          fontSize: 20,
        }),
        band(0, h - footerH, w, footerH, solid("#810004"), "Footer bar"),
        makeLogo({ x: w * 0.028, y: h - footerH * 0.75, width: 150, height: footerH * 0.5, mask: "rect", fit: "contain" }),
        siteText("www.kamuna.tv", {
          x: w * 0.4,
          y: h - footerH * 0.66,
          width: w * 0.55,
          height: footerH * 0.4,
          fill: "#ffffff",
          fontFamily: font,
          align: "right",
        }),
      ],
    };
  },
};

// 14. Vertical #1
const vertical1: TemplateDef = {
  id: "am-vertical1",
  name: "Vertical #1",
  nameBn: "ভার্টিক্যাল #১",
  category: "General",
  palette: { primary: "#D9232D", secondary: "#ffffff", accent: "#D9232D", text: "#ffffff", textAlt: "#D9232D" },
  tags: ["split", "quote", "portrait"],
  build: (w, h) => {
    const leftW = w * 0.5;
    return {
      background: solid("#ffffff"),
      layers: [
        makeImage({ x: leftW - w * 0.032, y: 0, width: w - leftW + w * 0.032, height: h, mask: "rect", cornerRadius: 0 }),
        {
          ...makeShape({
            name: "Left panel",
            shape: "rounded",
            x: 0,
            y: 0,
            width: leftW,
            height: h,
            fill: solid("#D9232D"),
            cornerRadius: 40,
          }),
        },
        siteText("“", {
          x: w * 0.056,
          y: h * 0.06,
          width: w * 0.2,
          height: h * 0.12,
          fill: "#ffffff",
          fontSize: 120,
          fontWeight: 700,
          align: "left",
        }),
        makeHeading("আজকের গুরুত্বপূর্ণ সব খবর, এক নজরে দেখে নিন।", {
          x: w * 0.056,
          y: h * 0.24,
          width: leftW - w * 0.112,
          height: h * 0.4,
          fill: "#ffffff",
          fontSize: 48,
          fontWeight: 600,
          align: "left",
          lineHeight: 1.4,
        }),
        makeLogo({ x: w * 0.056, y: h * 0.74, width: 160, height: 56, mask: "rect", fit: "contain" }),
        dateText("২০ সেপ্টেম্বর ২০২৫", {
          x: w * 0.056,
          y: h * 0.82,
          width: leftW - w * 0.112,
          fill: "#ffffff",
          align: "left",
          fontSize: 20,
        }),
        siteText("example.com", {
          x: w * 0.056,
          y: h * 0.86,
          width: leftW - w * 0.112,
          fill: "#ffffff",
          align: "left",
          fontSize: 20,
        }),
        band(leftW - w * 0.032, h * 0.86, w - leftW + w * 0.032, h * 0.14, solid("rgba(255,255,255,0.9)"), "Name plate"),
        subText("ড. পাগল কবি", {
          x: leftW,
          y: h * 0.88,
          width: w - leftW - w * 0.03,
          height: h * 0.05,
          fill: "#D9232D",
          fontWeight: 800,
          fontSize: 42,
          align: "left",
        }),
        makeText({
          role: "site",
          name: "Designation",
          text: "বিশ্বখ্যাত কবি ও সাহিত্যিক",
          x: leftW,
          y: h * 0.94,
          width: w - leftW - w * 0.03,
          height: h * 0.04,
          fill: "#333333",
          fontWeight: 500,
          fontSize: 24,
          align: "left",
          autoFit: true,
        }),
      ],
    };
  },
};

// 15. Gradient News Card
const gradientNews: TemplateDef = {
  id: "am-gradient-news",
  name: "Gradient News Card",
  nameBn: "গ্রেডিয়েন্ট নিউজ কার্ড",
  category: "General",
  palette: { primary: "#D9232D", secondary: "#000000", accent: "#D9232D", text: "#ffffff", textAlt: "#facc15" },
  tags: ["gradient", "overlay", "fullbleed"],
  build: (w, h) => {
    const footerH = h * 0.093;
    return {
      background: solid("#000000"),
      layers: [
        makeImage({ x: 0, y: 0, width: w, height: h, mask: "rect", cornerRadius: 0 }),
        band(0, h * 0.4, w, h * 0.6 - footerH, linear(0, [
          { color: "rgba(0,0,0,0)", offset: 0 },
          { color: "#D9232D", offset: 1 },
        ]), "Accent gradient"),
        {
          ...makeShape({
            name: "Logo tab",
            shape: "rounded",
            x: w - w * 0.176,
            y: 0,
            width: w * 0.13,
            height: h * 0.26,
            fill: solid("#D9232D"),
            cornerRadius: 65,
          }),
        },
        {
          ...makeLogo({
            x: w - w * 0.171,
            y: h * 0.13,
            width: w * 0.12,
            height: w * 0.12,
            mask: "circle",
            fit: "contain",
          }),
          stroke: { enabled: true, width: 4, color: "#ffffff" },
        },
        band(w * 0.056, h * 0.62, w * 0.012, h * 0.2, solid("#facc15"), "Vertical bar"),
        makeHeading(
          "মিডিয়া ছাড়লেন লোটাবাবা; পরলেন প্যান্টের উপর আন্ডারওয়ার, মুখ আর দেখাবেন না",
          {
            x: w * 0.09,
            y: h * 0.62,
            width: w * 0.85,
            height: h * 0.24,
            fill: "#ffffff",
            fontSize: 48,
            fontWeight: 700,
            align: "left",
            lineHeight: 1.2,
            shadow: { enabled: true, x: 0, y: 2, blur: 4, color: "#000000", opacity: 0.5 },
          },
        ),
        band(0, h - footerH, w, footerH, solid("#D9232D"), "Footer bar"),
        siteText("বিনোদন", {
          x: w * 0.056,
          y: h - footerH * 0.66,
          width: w * 0.3,
          height: footerH * 0.4,
          fill: "#ffffff",
          fontWeight: 500,
          fontSize: 32,
          align: "left",
        }),
        dateText("২৭ ডিসেম্বর ২০২৫", {
          x: w * 0.2,
          y: h - footerH * 0.66,
          width: w * 0.35,
          height: footerH * 0.4,
          fill: "#ffffff",
          fontSize: 32,
          align: "left",
        }),
        siteText("example.com", {
          x: w * 0.6,
          y: h - footerH * 0.66,
          width: w * 0.34,
          height: footerH * 0.4,
          fill: "#ffffff",
          fontWeight: 600,
          fontSize: 32,
          align: "right",
        }),
      ],
    };
  },
};

export const AMINUL_FRAMES: TemplateDef[] = [
  classic,
  modern,
  breaking,
  quote,
  minimal,
  feature,
  classikalo,
  bbc,
  ntv,
  btv,
  amaderdesh,
  somoy,
  jamuna,
  vertical1,
  gradientNews,
];
