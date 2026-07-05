// Max real weight each catalog font ships. Requesting a heavier weight makes the
// browser synthesize bold, which BREAKS Bengali conjunct shaping in Chrome
// (e.g. অক্ষরে splits at the hasant). Clamp to a real face to keep shaping.
export const FONT_MAX_WEIGHT: Record<string, number> = {
  "Hind Siliguri": 700,
  "Noto Sans Bengali": 800,
  "Noto Serif Bengali": 700,
  "Baloo Da 2": 800,
  "Anek Bangla": 800,
  "Tiro Bangla": 400,
  Atma: 700,
  Galada: 400,
  Mina: 700,
};

export function clampWeight(family: string, weight: number): number {
  const max = FONT_MAX_WEIGHT[family];
  return max ? Math.min(weight, max) : weight;
}
