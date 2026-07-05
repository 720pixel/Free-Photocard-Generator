"use client";

// Curated font catalog. Bengali first (primary locale), then popular Latin.
export interface FontDef {
  family: string;
  bengali: boolean;
  weights: number[];
}

export const FONTS: FontDef[] = [
  { family: "Hind Siliguri", bengali: true, weights: [300, 400, 500, 600, 700] },
  { family: "Noto Sans Bengali", bengali: true, weights: [400, 500, 600, 700, 800] },
  { family: "Noto Serif Bengali", bengali: true, weights: [400, 600, 700] },
  { family: "Baloo Da 2", bengali: true, weights: [400, 500, 600, 700, 800] },
  { family: "Anek Bangla", bengali: true, weights: [400, 600, 700, 800] },
  { family: "Tiro Bangla", bengali: true, weights: [400] },
  { family: "Atma", bengali: true, weights: [400, 500, 600, 700] },
  { family: "Galada", bengali: true, weights: [400] },
  { family: "Mina", bengali: true, weights: [400, 700] },
  { family: "Hind Siliguri", bengali: true, weights: [400, 700] },
  { family: "Inter", bengali: false, weights: [400, 500, 600, 700, 800] },
  { family: "Poppins", bengali: false, weights: [400, 500, 600, 700, 800] },
  { family: "Montserrat", bengali: false, weights: [400, 600, 700, 800] },
  { family: "Oswald", bengali: false, weights: [400, 500, 600, 700] },
  { family: "Anton", bengali: false, weights: [400] },
  { family: "Bebas Neue", bengali: false, weights: [400] },
  { family: "Playfair Display", bengali: false, weights: [400, 600, 700, 800] },
  { family: "Roboto", bengali: false, weights: [400, 500, 700] },
];

const loaded = new Set<string>();
const CATALOG = new Set(FONTS.map((f) => f.family));

// Font-family stack that ALWAYS appends Bengali fallbacks. A Latin-only font
// (catalog or a user's local/device font) has no Bengali glyphs, so the browser
// would render broken conjuncts; the fallback makes it borrow Hind Siliguri for
// those codepoints. Applies everywhere text is rendered (canvas + previews).
export function fontStack(family: string): string {
  return `"${family}", "Hind Siliguri", "Noto Sans Bengali", sans-serif`;
}

// Local (device) fonts discovered via the Local Font Access API.
let localFamilies: string[] = [];
export function getLocalFonts(): string[] {
  return localFamilies;
}
export function isLocalFontsSupported(): boolean {
  return typeof window !== "undefined" && typeof (window as unknown as { queryLocalFonts?: unknown }).queryLocalFonts === "function";
}

// Prompt the user (browser permission) and return installed font families.
export async function loadLocalFonts(): Promise<string[]> {
  const q = (window as unknown as { queryLocalFonts?: () => Promise<{ family: string }[]> }).queryLocalFonts;
  if (typeof q !== "function") {
    throw new Error("Your browser does not support device fonts. Try Chrome or Edge on desktop.");
  }
  const fonts = await q();
  const set = new Set<string>();
  for (const f of fonts) set.add(f.family);
  localFamilies = [...set].sort((a, b) => a.localeCompare(b));
  return localFamilies;
}

function cssUrl(family: string, weights: number[]): string {
  const w = weights.join(";");
  const fam = family.replace(/ /g, "+");
  return `https://fonts.googleapis.com/css2?family=${fam}:wght@${w}&display=swap`;
}

// Ensure a family is usable, then resolve. Google-catalog families get a
// stylesheet injected; local/system families are assumed already installed.
export async function loadFont(family: string): Promise<void> {
  const def = FONTS.find((f) => f.family === family);
  const weights = def?.weights ?? [400, 700];
  if (CATALOG.has(family) && !loaded.has(family)) {
    loaded.add(family);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl(family, weights);
    document.head.appendChild(link);
  }
  try {
    await Promise.all(weights.map((w) => document.fonts.load(`${w} 24px "${family}"`)));
    await document.fonts.ready;
  } catch {
    // offline / blocked / local-only: fall back silently to system stack
  }
}

// Ensure every font used in the current document is ready before export.
export async function ensureFontsReady(families: string[]): Promise<void> {
  await Promise.all([...new Set(families)].map(loadFont));
  await document.fonts.ready;
}
