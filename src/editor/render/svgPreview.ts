import type { EditorDoc, Fill, Gradient, ImageLayer, ShapeLayer, TextLayer } from "../types";
import { isCustomFrameShape, frameShapePath } from "../frameShapes";
import { clampWeight } from "../fontMeta";

// Deterministic SVG renderer that mirrors the Konva renderer closely enough for
// faithful thumbnails. Pure + server-safe: used by the picker, landing gallery
// and category pages so previews always match the real editor output.

let idc = 0;
function gid() {
  return `g${(idc = (idc + 1) % 1e6)}`;
}

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}

function gradientDef(g: Gradient, id: string, w: number, h: number): string {
  const stops = g.stops.map((s) => `<stop offset="${(s.offset * 100).toFixed(1)}%" stop-color="${s.color}"/>`).join("");
  if (g.type === "radial") {
    return `<radialGradient id="${id}" cx="50%" cy="50%" r="60%">${stops}</radialGradient>`;
  }
  // linear + conic(approx as linear) — map angle to x1,y1,x2,y2
  const rad = (g.angle * Math.PI) / 180;
  const dx = Math.cos(rad), dy = Math.sin(rad);
  const x1 = (0.5 - dx / 2) * 100, y1 = (0.5 - dy / 2) * 100, x2 = (0.5 + dx / 2) * 100, y2 = (0.5 + dy / 2) * 100;
  return `<linearGradient id="${id}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">${stops}</linearGradient>`;
}

function paint(fill: Fill, defs: string[], w: number, h: number): string {
  if (fill.kind === "none") return "none";
  if (fill.kind === "solid") return fill.color;
  const id = gid();
  defs.push(gradientDef(fill.gradient, id, w, h));
  return `url(#${id})`;
}

function shapeSvg(l: ShapeLayer, defs: string[], W: number, H: number): string {
  const fill = paint(l.fill, defs, l.width, l.height);
  const stroke = l.stroke.enabled ? ` stroke="${l.stroke.color}" stroke-width="${l.stroke.width}"` : "";
  const dash = l.dash.length ? ` stroke-dasharray="${l.dash.join(",")}"` : "";
  const op = ` opacity="${l.opacity}"`;
  const rot = l.rotation ? ` transform="rotate(${l.rotation} ${l.x + l.width / 2} ${l.y + l.height / 2})"` : "";
  if (l.shape === "path" && l.pathData) {
    return `<path d="${l.pathData}" fill="${fill}"${stroke}${dash}${op}${rot}/>`;
  }
  if (l.shape === "circle") {
    const r = Math.min(l.width, l.height) / 2;
    return `<circle cx="${l.x + l.width / 2}" cy="${l.y + l.height / 2}" r="${r}" fill="${fill}"${stroke}${dash}${op}${rot}/>`;
  }
  if (l.shape === "ellipse") {
    return `<ellipse cx="${l.x + l.width / 2}" cy="${l.y + l.height / 2}" rx="${l.width / 2}" ry="${l.height / 2}" fill="${fill}"${stroke}${dash}${op}${rot}/>`;
  }
  if (l.shape === "triangle") {
    const pts = `${l.x + l.width / 2},${l.y} ${l.x + l.width},${l.y + l.height} ${l.x},${l.y + l.height}`;
    return `<polygon points="${pts}" fill="${fill}"${stroke}${dash}${op}${rot}/>`;
  }
  const rx = l.shape === "rounded" ? l.cornerRadius : 0;
  return `<rect x="${l.x}" y="${l.y}" width="${l.width}" height="${l.height}" rx="${rx}" fill="${fill}"${stroke}${dash}${op}${rot}/>`;
}

// Demo photo scenes so preview thumbnails read as finished cards instead of
// empty grey slots. Deterministic per slot for tasteful variety.
const DEMO_SCENES = [
  { sky: ["#fcd9a8", "#ef9f57"], sun: "#fff0d4", hill: "#c56a3f" }, // warm dusk
  { sky: ["#bcd8e8", "#6b9bb8"], sun: "#eef8ff", hill: "#3f5f74" }, // cool day
  { sky: ["#e7d6f0", "#a98cc0"], sun: "#f7efff", hill: "#5c4a72" }, // lavender
  { sky: ["#d9e9d0", "#82a36c"], sun: "#f1f8ea", hill: "#3f5230" }, // meadow
  { sky: ["#f4cbc3", "#dd8f8f"], sun: "#ffece8", hill: "#7a3f3f" }, // rose
  { sky: ["#cfd5e0", "#8a95a8"], sun: "#f0f3f8", hill: "#414a5c" }, // slate
];

function demoScene(l: ImageLayer, defs: string[], clipId: string): string {
  const idx = Math.abs(Math.round(l.x + l.y * 1.7 + l.width * 0.5)) % DEMO_SCENES.length;
  const sc = DEMO_SCENES[idx];
  const gid2 = gid();
  defs.push(
    `<linearGradient id="${gid2}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="${sc.sky[0]}"/><stop offset="100%" stop-color="${sc.sky[1]}"/></linearGradient>`,
  );
  const x = l.x, y = l.y, w = l.width, h = l.height;
  const sunR = Math.min(w, h) * 0.15;
  const sunX = x + w * 0.7;
  const sunY = y + h * 0.3;
  // two soft hills across the bottom
  const hillY = y + h * 0.6;
  const p1 = `M ${x} ${y + h} L ${x} ${hillY + h * 0.15} Q ${x + w * 0.3} ${hillY - h * 0.05} ${x + w * 0.55} ${hillY + h * 0.12} T ${x + w} ${hillY + h * 0.08} L ${x + w} ${y + h} Z`;
  const p2 = `M ${x} ${y + h} L ${x} ${hillY + h * 0.3} Q ${x + w * 0.35} ${hillY + h * 0.14} ${x + w * 0.7} ${hillY + h * 0.32} T ${x + w} ${hillY + h * 0.28} L ${x + w} ${y + h} Z`;
  return (
    `<g clip-path="url(#${clipId})">` +
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${gid2})"/>` +
    `<circle cx="${sunX}" cy="${sunY}" r="${sunR}" fill="${sc.sun}" opacity="0.95"/>` +
    `<path d="${p1}" fill="${sc.hill}" opacity="0.55"/>` +
    `<path d="${p2}" fill="${sc.hill}" opacity="0.85"/>` +
    `</g>`
  );
}

function logoGlyph(cx: number, cy: number, s: number, color: string): string {
  return `<circle cx="${cx}" cy="${cy}" r="${s * 0.34}" fill="none" stroke="${color}" stroke-width="${Math.max(1.4, s * 0.05)}" opacity="0.6"/><circle cx="${cx}" cy="${cy}" r="${s * 0.1}" fill="${color}" opacity="0.5"/>`;
}

// When a slot holds a real photo (data/object URL) draw it faithfully; empty
// slots keep the demo scene so template thumbnails still read as finished cards.
function realImage(l: ImageLayer, clipId: string): string {
  const par = l.fit === "contain" ? "xMidYMid meet" : "xMidYMid slice";
  return `<image clip-path="url(#${clipId})" href="${l.src}" x="${l.x}" y="${l.y}" width="${l.width}" height="${l.height}" preserveAspectRatio="${par}"/>`;
}
function sceneOrImage(l: ImageLayer, defs: string[], clipId: string): string {
  return l.src ? realImage(l, clipId) : demoScene(l, defs, clipId);
}

function imageSvg(l: ImageLayer, defs: string[], W: number, H: number): string {
  const rot = l.rotation ? ` transform="rotate(${l.rotation} ${l.x + l.width / 2} ${l.y + l.height / 2})"` : "";
  const isLogo = l.type === "logo";
  const cx = l.x + l.width / 2;
  const cy = l.y + l.height / 2;
  const s = Math.min(l.width, l.height);
  const g = `<g${rot} opacity="${l.opacity}">`;

  // Logos: draw the real mark if present, else a subtle monogram placeholder.
  if (isLogo) {
    const rx = l.mask === "rounded" ? l.cornerRadius : 0;
    if (l.src) {
      const cid = gid();
      if (l.mask === "circle") {
        defs.push(`<clipPath id="${cid}"><circle cx="${cx}" cy="${cy}" r="${s / 2}"/></clipPath>`);
      } else {
        defs.push(`<clipPath id="${cid}"><rect x="${l.x}" y="${l.y}" width="${l.width}" height="${l.height}" rx="${rx}"/></clipPath>`);
      }
      return `${g}${realImage(l, cid)}</g>`;
    }
    const glyph = logoGlyph(cx, cy, s, "#8a8378");
    if (l.mask === "circle") {
      const r = s / 2;
      return `${g}<circle cx="${cx}" cy="${cy}" r="${r}" fill="#eeebe3"/>${glyph}</g>`;
    }
    return `${g}<rect x="${l.x}" y="${l.y}" width="${l.width}" height="${l.height}" rx="${rx}" fill="#eeebe3"/>${glyph}</g>`;
  }

  const cid = gid();
  if (l.mask === "circle") {
    const r = s / 2;
    defs.push(`<clipPath id="${cid}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath>`);
    const scene = sceneOrImage(l, defs, cid);
    const stroke = l.stroke.enabled ? `<circle cx="${cx}" cy="${cy}" r="${r - l.stroke.width / 2}" fill="none" stroke="${l.stroke.color}" stroke-width="${l.stroke.width}"/>` : "";
    return `${g}${scene}${stroke}</g>`;
  }
  if (isCustomFrameShape(l.mask)) {
    const d = frameShapePath(l.mask, l.x, l.y, l.width, l.height)!;
    defs.push(`<clipPath id="${cid}"><path d="${d}"/></clipPath>`);
    const scene = sceneOrImage(l, defs, cid);
    const stroke = l.stroke.enabled ? `<path d="${d}" fill="none" stroke="${l.stroke.color}" stroke-width="${l.stroke.width}"/>` : "";
    return `${g}${scene}${stroke}</g>`;
  }
  const rx = l.mask === "rounded" ? l.cornerRadius : 0;
  defs.push(`<clipPath id="${cid}"><rect x="${l.x}" y="${l.y}" width="${l.width}" height="${l.height}" rx="${rx}"/></clipPath>`);
  const scene = sceneOrImage(l, defs, cid);
  const stroke = l.stroke.enabled ? `<rect x="${l.x}" y="${l.y}" width="${l.width}" height="${l.height}" rx="${rx}" fill="none" stroke="${l.stroke.color}" stroke-width="${l.stroke.width}"/>` : "";
  return `${g}${scene}${stroke}</g>`;
}

// wrap text into lines given an average glyph width factor
function wrapLines(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const wd of words) {
    if ((cur + " " + wd).trim().length > maxCharsPerLine && cur) {
      lines.push(cur);
      cur = wd;
    } else cur = (cur + " " + wd).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}

function textSvg(l: TextLayer, W: number, H: number, clipId: string): string {
  const anchor = l.align === "center" ? "middle" : l.align === "right" ? "end" : "start";
  const tx = l.align === "center" ? l.x + l.width / 2 : l.align === "right" ? l.x + l.width : l.x;
  const weight = clampWeight(l.fontFamily, l.fontWeight);
  const rot = l.rotation ? ` transform="rotate(${l.rotation} ${l.x + l.width / 2} ${l.y + l.height / 2})"` : "";
  const stroke = l.stroke.enabled ? ` stroke="${l.stroke.color}" stroke-width="${l.stroke.width}" paint-order="stroke"` : "";

  // Auto-fit like the editor: shrink font until wrapped text fits width AND height.
  const CW = 0.58; // avg glyph width factor (Bengali runs wide)
  let size = l.fontSize;
  let lines: string[] = [];
  for (let i = 0; i < 60; i++) {
    const maxChars = Math.max(4, Math.floor(l.width / (size * CW)));
    lines = wrapLines(l.text, maxChars);
    const totalH = lines.length * size * l.lineHeight;
    if ((totalH <= l.height || size <= 14) && lines.length <= 6) break;
    size -= 2;
  }
  const lh = size * l.lineHeight;
  const startY = l.y + size * 0.92;
  const tspans = lines
    .map((ln, i) => `<tspan x="${tx}" y="${(startY + i * lh).toFixed(1)}">${esc(ln)}</tspan>`)
    .join("");
  return `<text clip-path="url(#${clipId})" font-family="${esc(l.fontFamily)}, Hind Siliguri, sans-serif" font-size="${size}" font-weight="${weight}" fill="${l.fill}" text-anchor="${anchor}" opacity="${l.opacity}"${stroke}${rot}>${tspans}</text>`;
}

export function renderTemplateSvg(doc: EditorDoc, W: number, H: number): string {
  const defs: string[] = [];
  const bg = paint(doc.background, defs, W, H);
  const parts: string[] = [`<rect x="0" y="0" width="${W}" height="${H}" fill="${bg}"/>`];
  for (const l of doc.layers) {
    if (!l.visible) continue;
    if (l.type === "text") {
      // clip each text to a padded version of its box so overflow never bleeds
      const cid = gid();
      const pad = 6;
      defs.push(`<clipPath id="${cid}"><rect x="${l.x - pad}" y="${l.y - pad}" width="${l.width + pad * 2}" height="${l.height + pad * 2}"/></clipPath>`);
      parts.push(textSvg(l, W, H, cid));
    } else if (l.type === "image" || l.type === "logo") parts.push(imageSvg(l, defs, W, H));
    else parts.push(shapeSvg(l as ShapeLayer, defs, W, H));
  }
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" width="100%" height="100%"><defs>${defs.join("")}</defs>${parts.join("")}</svg>`;
}
