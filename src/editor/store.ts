"use client";
import { create } from "zustand";
import { temporal } from "zundo";
import { DEFAULT_SIZE, presetByKey, type SizeKey } from "@/lib/presets";
import type { EditorDoc, Fill, Layer, RetouchRegion, RetouchSpec, RetouchStroke } from "./types";
import { solid } from "./factories";
import { reflowLayers } from "./relayout";

const DEFAULT_RETOUCH: RetouchSpec = { mode: "blur", intensity: 16, strokes: [], regions: [] };

function dimsOf(size: SizeKey | "custom", customW: number, customH: number) {
  if (size === "custom") return { w: customW, h: customH };
  const p = presetByKey(size);
  return { w: p.w, h: p.h };
}

const BLANK: EditorDoc = {
  schemaVersion: 1,
  templateId: null,
  size: DEFAULT_SIZE,
  customW: 1080,
  customH: 1350,
  background: solid("#ffffff"),
  layers: [],
};

interface EditorState {
  doc: EditorDoc;
  selectedId: string | null;
  freeMode: boolean; // allow deliberate overlap
  locale: "bn" | "en";
  // actions
  setDoc: (doc: EditorDoc) => void;
  loadTemplate: (doc: EditorDoc) => void;
  reset: () => void;
  setSize: (size: SizeKey | "custom", w?: number, h?: number) => void;
  setBackground: (fill: Fill) => void;
  select: (id: string | null) => void;
  addLayer: (layer: Layer, atTop?: boolean) => void;
  addLayers: (layers: Layer[]) => void;
  updateLayer: (id: string, patch: Partial<Layer>) => void;
  updateLayerFn: (id: string, fn: (l: Layer) => Layer) => void;
  removeLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  fillImage: (id: string, src: string, naturalWidth: number, naturalHeight: number) => void;
  catchIntoFrame: (sourceId: string, frameId: string) => void;
  moveLayer: (id: string, dir: "up" | "down" | "top" | "bottom") => void;
  reorderLayers: (ids: string[]) => void;
  setPositions: (pos: Record<string, { x: number; y: number }>) => void;
  toggleFreeMode: () => void;
  setLocale: (l: "bn" | "en") => void;
  // Retouch tool (transient UI state) + doc mutations
  retouchActive: boolean;
  retouchTool: "brush" | "rect" | "circle";
  retouchBrush: number;
  setRetouchActive: (v: boolean) => void;
  setRetouchTool: (t: "brush" | "rect" | "circle") => void;
  setRetouchBrush: (n: number) => void;
  setRetouchOpts: (id: string, patch: Partial<Pick<RetouchSpec, "mode" | "intensity">>) => void;
  addRetouchStroke: (id: string, stroke: RetouchStroke) => void;
  addRetouchRegion: (id: string, region: RetouchRegion) => void;
  clearRetouch: (id: string) => void;
}

function withRetouch(l: Layer): RetouchSpec {
  if (l.type !== "image" && l.type !== "logo") return { ...DEFAULT_RETOUCH };
  return l.retouch ?? { ...DEFAULT_RETOUCH };
}

export const useEditor = create<EditorState>()(
  temporal(
    (set, get) => ({
      doc: BLANK,
      selectedId: null,
      freeMode: false,
      locale: "bn",

      setDoc: (doc) => set({ doc }),
      loadTemplate: (doc) => set({ doc: structuredClone(doc), selectedId: null }),
      reset: () => set({ doc: structuredClone(BLANK), selectedId: null }),

      setSize: (size, w, h) =>
        set((s) => {
          const nextCustomW = w ?? s.doc.customW;
          const nextCustomH = h ?? s.doc.customH;
          const from = dimsOf(s.doc.size, s.doc.customW, s.doc.customH);
          const to = dimsOf(size, nextCustomW, nextCustomH);
          return {
            doc: {
              ...s.doc,
              size,
              customW: nextCustomW,
              customH: nextCustomH,
              layers: reflowLayers(s.doc.layers, from, to),
            },
          };
        }),

      setBackground: (fill) => set((s) => ({ doc: { ...s.doc, background: fill } })),

      select: (id) => set((s) => ({ selectedId: id, retouchActive: id === s.selectedId ? s.retouchActive : false })),

      addLayer: (layer, atTop = true) =>
        set((s) => ({
          doc: {
            ...s.doc,
            layers: atTop ? [...s.doc.layers, layer] : [layer, ...s.doc.layers],
          },
          selectedId: layer.id,
        })),

      addLayers: (layers) =>
        set((s) => ({
          doc: { ...s.doc, layers: [...s.doc.layers, ...layers] },
          selectedId: layers[layers.length - 1]?.id ?? s.selectedId,
        })),

      updateLayer: (id, patch) =>
        set((s) => ({
          doc: {
            ...s.doc,
            layers: s.doc.layers.map((l) => (l.id === id ? ({ ...l, ...patch } as Layer) : l)),
          },
        })),

      updateLayerFn: (id, fn) =>
        set((s) => ({
          doc: {
            ...s.doc,
            layers: s.doc.layers.map((l) => (l.id === id ? fn(l) : l)),
          },
        })),

      removeLayer: (id) =>
        set((s) => ({
          doc: { ...s.doc, layers: s.doc.layers.filter((l) => l.id !== id) },
          selectedId: s.selectedId === id ? null : s.selectedId,
        })),

      duplicateLayer: (id) =>
        set((s) => {
          const src = s.doc.layers.find((l) => l.id === id);
          if (!src) return s;
          const copy = {
            ...structuredClone(src),
            id: `${src.type[0]}_${Math.random().toString(36).slice(2, 10)}`,
            x: src.x + 24,
            y: src.y + 24,
            name: `${src.name} copy`,
          } as Layer;
          const idx = s.doc.layers.findIndex((l) => l.id === id);
          const layers = [...s.doc.layers];
          layers.splice(idx + 1, 0, copy);
          return { doc: { ...s.doc, layers }, selectedId: copy.id };
        }),

      fillImage: (id, src, naturalWidth, naturalHeight) =>
        set((s) => ({
          doc: {
            ...s.doc,
            layers: s.doc.layers.map((l) =>
              l.id === id && (l.type === "image" || l.type === "logo")
                ? ({ ...l, src, naturalWidth, naturalHeight } as Layer)
                : l,
            ),
          },
          selectedId: id,
        })),

      // Canva-style catch: a dragged photo dropped onto an empty frame pours its
      // image into that frame and the loose photo is consumed.
      catchIntoFrame: (sourceId, frameId) =>
        set((s) => {
          const src = s.doc.layers.find((l) => l.id === sourceId);
          if (!src || (src.type !== "image" && src.type !== "logo")) return s;
          const layers = s.doc.layers
            .map((l) =>
              l.id === frameId && (l.type === "image" || l.type === "logo")
                ? ({ ...l, src: src.src, naturalWidth: src.naturalWidth, naturalHeight: src.naturalHeight, offsetX: 0.5, offsetY: 0.5, zoom: 1 } as Layer)
                : l,
            )
            .filter((l) => l.id !== sourceId);
          return { doc: { ...s.doc, layers }, selectedId: frameId };
        }),

      moveLayer: (id, dir) =>
        set((s) => {
          const layers = [...s.doc.layers];
          const i = layers.findIndex((l) => l.id === id);
          if (i < 0) return s;
          const [item] = layers.splice(i, 1);
          if (dir === "top") layers.push(item);
          else if (dir === "bottom") layers.unshift(item);
          else if (dir === "up") layers.splice(Math.min(layers.length, i + 1), 0, item);
          else layers.splice(Math.max(0, i - 1), 0, item);
          return { doc: { ...s.doc, layers } };
        }),

      reorderLayers: (ids) =>
        set((s) => {
          const map = new Map(s.doc.layers.map((l) => [l.id, l]));
          const layers = ids.map((id) => map.get(id)!).filter(Boolean);
          return { doc: { ...s.doc, layers } };
        }),

      setPositions: (pos) =>
        set((s) => ({
          doc: { ...s.doc, layers: s.doc.layers.map((l) => (pos[l.id] ? ({ ...l, x: pos[l.id].x, y: pos[l.id].y } as Layer) : l)) },
        })),

      toggleFreeMode: () => set((s) => ({ freeMode: !s.freeMode })),
      setLocale: (l) => set({ locale: l }),

      retouchActive: false,
      retouchTool: "brush",
      retouchBrush: 60,
      setRetouchActive: (v) => set({ retouchActive: v }),
      setRetouchTool: (t) => set({ retouchTool: t }),
      setRetouchBrush: (n) => set({ retouchBrush: n }),
      setRetouchOpts: (id, patch) =>
        set((s) => ({
          doc: {
            ...s.doc,
            layers: s.doc.layers.map((l) => (l.id === id ? ({ ...l, retouch: { ...withRetouch(l), ...patch } } as Layer) : l)),
          },
        })),
      addRetouchStroke: (id, stroke) =>
        set((s) => ({
          doc: {
            ...s.doc,
            layers: s.doc.layers.map((l) => {
              if (l.id !== id) return l;
              const rt = withRetouch(l);
              return { ...l, retouch: { ...rt, strokes: [...rt.strokes, stroke] } } as Layer;
            }),
          },
        })),
      addRetouchRegion: (id, region) =>
        set((s) => ({
          doc: {
            ...s.doc,
            layers: s.doc.layers.map((l) => {
              if (l.id !== id) return l;
              const rt = withRetouch(l);
              return { ...l, retouch: { ...rt, regions: [...rt.regions, region] } } as Layer;
            }),
          },
        })),
      clearRetouch: (id) =>
        set((s) => ({
          doc: {
            ...s.doc,
            layers: s.doc.layers.map((l) => {
              if (l.id !== id) return l;
              const rt = withRetouch(l);
              return { ...l, retouch: { ...rt, strokes: [], regions: [] } } as Layer;
            }),
          },
        })),
    }),
    {
      limit: 50,
      // Only track document changes in history, not selection/ui state.
      partialize: (state) => ({ doc: state.doc }) as Partial<EditorState>,
      equality: (a, b) => JSON.stringify(a.doc) === JSON.stringify(b.doc),
    },
  ),
);

export const useTemporalStore = useEditor.temporal;
