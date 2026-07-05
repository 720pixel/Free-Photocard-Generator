import { makeImage } from "./factories";
import type { ImageLayer } from "./types";

// Ready-made raster backgrounds (paper / grunge / torn-paper textures) that a
// user can drop into a design and then freely modify — move, resize, restyle
// opacity, blend mode, mask, colour adjustments — like any other image layer.
export interface BgAsset {
  id: string;
  label: string;
  src: string;
  category: "Paper" | "Grunge" | "Torn";
}

export const BACKGROUNDS: BgAsset[] = [
  { id: "paper-1", label: "Paper 1", src: "/textures/backgrounds/paper-1.webp", category: "Paper" },
  { id: "paper-2", label: "Paper 2", src: "/textures/backgrounds/paper-2.webp", category: "Paper" },
  { id: "paper-3", label: "Paper 3", src: "/textures/backgrounds/paper-3.webp", category: "Paper" },
  { id: "paper-4", label: "Paper 4", src: "/textures/backgrounds/paper-4.webp", category: "Paper" },
  { id: "grunge-1", label: "Grunge 1", src: "/textures/backgrounds/grunge-1.webp", category: "Grunge" },
  { id: "grunge-2", label: "Grunge 2", src: "/textures/backgrounds/grunge-2.webp", category: "Grunge" },
  { id: "torn-1", label: "Torn 1", src: "/textures/backgrounds/torn-1.webp", category: "Torn" },
  { id: "torn-2", label: "Torn 2", src: "/textures/backgrounds/torn-2.webp", category: "Torn" },
  { id: "torn-3", label: "Torn 3", src: "/textures/backgrounds/torn-3.webp", category: "Torn" },
  { id: "torn-4", label: "Torn 4", src: "/textures/backgrounds/torn-4.webp", category: "Torn" },
  { id: "torn-5", label: "Torn 5", src: "/textures/backgrounds/torn-5.webp", category: "Torn" },
  { id: "torn-6", label: "Torn 6", src: "/textures/backgrounds/torn-6.webp", category: "Torn" },
];

// A full-bleed, fully editable image layer for the chosen background. Added at
// the bottom of the stack so it sits behind the design; the user can still
// select and restyle it.
export function makeBackgroundLayer(a: BgAsset, w: number, h: number): ImageLayer {
  return makeImage({
    name: `Background · ${a.label}`,
    x: 0,
    y: 0,
    width: w,
    height: h,
    src: a.src,
    naturalWidth: 1080,
    naturalHeight: 1350,
    fit: "cover",
    mask: "rect",
    cornerRadius: 0,
    placeholderLabel: "",
  });
}
