import { makeHeading, makeLogo, makeText, solid } from "../factories";
import { band } from "./helpers";
import { buildCollage, buildCollageIn, collageById } from "../collage";
import type { TemplateDef } from "./types";

function handle(text: string, x: number, y: number, w: number, color: string, align: "left" | "center" | "right" = "left") {
  return makeText({ role: "site", name: "Handle", text, x, y, width: w, height: 46, fontSize: 26, fontWeight: 600, fill: color, align, letterSpacing: 2 });
}

// Multi-photo collage templates. Each drops a grid of editable photo slots plus
// a caption band with heading, logo and handle.

const gridStory: TemplateDef = {
  id: "collage-grid-story",
  name: "Grid Story",
  nameBn: "গ্রিড স্টোরি",
  category: "Collage",
  palette: { primary: "#f3ede1", secondary: "#1c1917", accent: "#c06a3f", text: "#1c1917", textAlt: "#c06a3f" },
  tags: ["collage", "grid", "2x2", "story"],
  elements: ["divider", "tag", "badge"],
  build: (w, h) => ({
    background: solid("#f3ede1"),
    layers: [
      ...buildCollageIn(collageById("grid-2x2")!, w * 0.06, h * 0.06, w * 0.88, h * 0.66),
      band(w * 0.06, h * 0.78, w * 0.14, Math.max(6, h * 0.008), solid("#c06a3f"), "Kicker"),
      makeLogo({ x: w * 0.82, y: h * 0.76, width: 74, height: 74 }),
      makeHeading("চার ছবির গল্প", { x: w * 0.06, y: h * 0.8, width: w * 0.72, height: h * 0.14, fill: "#1c1917", fontSize: 74, align: "left" }),
      handle("@yourpage", w * 0.06, h * 0.93, w * 0.6, "#c06a3f"),
    ],
  }),
};

const heroThree: TemplateDef = {
  id: "collage-hero-three",
  name: "Hero Trio",
  nameBn: "হিরো ট্রায়ো",
  category: "Collage",
  palette: { primary: "#faf7f0", secondary: "#1c1917", accent: "#6b705c", text: "#1c1917", textAlt: "#6b705c" },
  tags: ["collage", "hero", "trio"],
  elements: ["ribbon", "divider", "tag"],
  build: (w, h) => ({
    background: solid("#faf7f0"),
    layers: [
      ...buildCollageIn(collageById("hero-top")!, w * 0.06, h * 0.14, w * 0.88, h * 0.7),
      makeLogo({ x: w * 0.06, y: h * 0.04, width: 72, height: 72 }),
      makeHeading("তিন মুহূর্ত", { x: w * 0.2, y: h * 0.045, width: w * 0.6, height: h * 0.08, fill: "#1c1917", fontSize: 56, align: "left" }),
      handle("@yourpage", w * 0.06, h * 0.9, w * 0.6, "#6b705c"),
    ],
  }),
};

const filmStrip: TemplateDef = {
  id: "collage-film-strip",
  name: "Column Strip",
  nameBn: "কলাম স্ট্রিপ",
  category: "Collage",
  palette: { primary: "#ede6d6", secondary: "#1c1917", accent: "#a8562f", text: "#1c1917", textAlt: "#a8562f" },
  tags: ["collage", "columns", "strip"],
  elements: ["divider", "badge", "underline"],
  build: (w, h) => ({
    background: solid("#ede6d6"),
    layers: [
      ...buildCollageIn(collageById("cols-3")!, w * 0.06, h * 0.06, w * 0.88, h * 0.62),
      makeLogo({ x: w * 0.06, y: h * 0.74, width: 74, height: 74 }),
      makeHeading("তিন কলাম", { x: w * 0.06, y: h * 0.82, width: w * 0.88, height: h * 0.12, fill: "#1c1917", fontSize: 78, fontWeight: 800, align: "left" }),
      handle("@yourpage", w * 0.06, h * 0.94, w * 0.6, "#a8562f"),
    ],
  }),
};

const bigTwo: TemplateDef = {
  id: "collage-big-two",
  name: "Feature + Two",
  nameBn: "ফিচার প্লাস টু",
  category: "Collage",
  palette: { primary: "#f7f3ec", secondary: "#1c1917", accent: "#606c38", text: "#1c1917", textAlt: "#606c38" },
  tags: ["collage", "feature", "big"],
  elements: ["tag", "divider", "ribbon"],
  build: (w, h) => ({
    background: solid("#f7f3ec"),
    layers: [
      ...buildCollageIn(collageById("hero-left")!, w * 0.06, h * 0.06, w * 0.88, h * 0.68),
      band(w * 0.06, h * 0.79, w * 0.12, Math.max(6, h * 0.008), solid("#606c38"), "Kicker"),
      makeLogo({ x: w * 0.82, y: h * 0.77, width: 72, height: 72 }),
      makeHeading("মূল ছবি ও দুটি", { x: w * 0.06, y: h * 0.81, width: w * 0.72, height: h * 0.13, fill: "#1c1917", fontSize: 66, align: "left" }),
      handle("@yourpage", w * 0.06, h * 0.94, w * 0.6, "#606c38"),
    ],
  }),
};

const sixGrid: TemplateDef = {
  id: "collage-six-grid",
  name: "Six Grid",
  nameBn: "সিক্স গ্রিড",
  category: "Collage",
  palette: { primary: "#e8e0d0", secondary: "#1c1917", accent: "#bc6c25", text: "#1c1917", textAlt: "#bc6c25" },
  tags: ["collage", "grid", "2x3", "six"],
  elements: ["badge", "tag", "divider"],
  build: (w, h) => ({
    background: solid("#e8e0d0"),
    layers: [
      ...buildCollageIn(collageById("grid-2x3")!, w * 0.06, h * 0.13, w * 0.88, h * 0.74),
      makeLogo({ x: w * 0.06, y: h * 0.045, width: 66, height: 66 }),
      makeHeading("ছয় ছবির গ্রিড", { x: w * 0.19, y: h * 0.05, width: w * 0.62, height: h * 0.07, fill: "#1c1917", fontSize: 50, align: "left" }),
      handle("@yourpage", w * 0.06, h * 0.91, w * 0.6, "#bc6c25"),
    ],
  }),
};

const splitDuo: TemplateDef = {
  id: "collage-split-duo",
  name: "Split Duo",
  nameBn: "স্প্লিট ডুও",
  category: "Collage",
  palette: { primary: "#f5f0e6", secondary: "#1c1917", accent: "#8a5a44", text: "#ffffff", textAlt: "#8a5a44" },
  tags: ["collage", "split", "duo", "before after"],
  elements: ["divider", "badge", "ribbon"],
  build: (w, h) => ({
    background: solid("#f5f0e6"),
    layers: [
      ...buildCollage(collageById("split-2")!, w, h),
      band(0, h * 0.44, w, h * 0.12, solid("#1c1917"), "Caption bar"),
      makeHeading("আগে ও পরে", { x: w * 0.08, y: h * 0.46, width: w * 0.84, height: h * 0.08, fill: "#ffffff", fontSize: 60, align: "center" }),
      makeLogo({ x: w * 0.5 - 34, y: h * 0.03, width: 68, height: 68, mask: "circle" }),
    ],
  }),
};

export const COLLAGE_TEMPLATES: TemplateDef[] = [gridStory, heroThree, filmStrip, bigTwo, sixGrid, splitDuo];
