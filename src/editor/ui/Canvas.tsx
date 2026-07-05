"use client";
import dynamic from "next/dynamic";
import { forwardRef, useEffect, useRef, useState } from "react";
import type { StageHandle } from "../render/Stage";
import { useEditor } from "../store";
import { docDimensions, type ImageLayer } from "../types";
import { presetByKey } from "@/lib/presets";
import { ingestImage, fileFromClipboard } from "../ingest";
import { makeImage } from "../factories";
import { useTemporalStore } from "../store";

const EditorStage = dynamic(() => import("../render/Stage").then((m) => m.EditorStage), {
  ssr: false,
  loading: () => <div className="grid h-full w-full place-items-center text-sm text-ink-soft">ক্যানভাস লোড হচ্ছে...</div>,
});

export const Canvas = forwardRef<StageHandle, { onRequestTextEdit?: (id: string) => void }>(function Canvas(
  { onRequestTextEdit },
  ref,
) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageHandle = useRef<StageHandle | null>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [dragOver, setDragOver] = useState(false);
  const doc = useEditor((s) => s.doc);
  const selectedId = useEditor((s) => s.selectedId);
  const updateLayer = useEditor((s) => s.updateLayer);
  const removeLayer = useEditor((s) => s.removeLayer);

  const { w, h } = docDimensions(doc, presetByKey);

  // Merge the forwarded ref with a local one so drop handling can read the stage.
  const setStageRef = (h2: StageHandle | null) => {
    stageHandle.current = h2;
    if (typeof ref === "function") ref(h2);
    else if (ref) (ref as React.MutableRefObject<StageHandle | null>).current = h2;
  };

  // Drop an image file onto the canvas: fill the empty frame under the cursor,
  // else the selected empty slot, else drop a fresh photo at that point.
  const onDropFile = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/"));
    if (!file) return;
    let dataUrl: string, width: number, height: number;
    try {
      ({ dataUrl, width, height } = await ingestImage(file));
    } catch {
      return;
    }
    const st = useEditor.getState();
    const layers = st.doc.layers;
    let cx = w / 2;
    let cy = h / 2;
    const stage = stageHandle.current?.stage();
    if (stage) {
      const rect = stage.container().getBoundingClientRect();
      const sc = stage.scaleX() || 1;
      cx = (e.clientX - rect.left) / sc;
      cy = (e.clientY - rect.top) / sc;
    }
    let target: (typeof layers)[number] | null = null;
    for (let i = layers.length - 1; i >= 0; i--) {
      const l = layers[i];
      if ((l.type === "image" || l.type === "logo") && !l.src && cx >= l.x && cx <= l.x + l.width && cy >= l.y && cy <= l.y + l.height) {
        target = l;
        break;
      }
    }
    if (!target) {
      const sel = layers.find((l) => l.id === st.selectedId && (l.type === "image" || l.type === "logo") && !l.src);
      if (sel) target = sel;
    }
    if (target) {
      st.fillImage(target.id, dataUrl, width, height);
    } else {
      const size = Math.min(w, h) * 0.4;
      st.addLayer(makeImage({ x: cx - size / 2, y: cy - size / 2, width: size, height: size, src: dataUrl, naturalWidth: width, naturalHeight: height }));
    }
  };

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const pad = 48;
      setBox({ w: el.clientWidth - pad, h: el.clientHeight - pad });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Paste image anywhere -> selected image/logo, else first image slot.
  useEffect(() => {
    const onPaste = async (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const file = await fileFromClipboard(e.clipboardData.items);
      if (!file) return;
      e.preventDefault();
      try {
        const { dataUrl, width, height } = await ingestImage(file);
        const layers = useEditor.getState().doc.layers;
        const target =
          layers.find((l) => l.id === selectedId && (l.type === "image" || l.type === "logo")) ??
          layers.find((l) => l.type === "image" || l.type === "logo");
        if (target) updateLayer(target.id, { src: dataUrl, naturalWidth: width, naturalHeight: height } as Partial<ImageLayer>);
      } catch {}
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [selectedId, updateLayer]);

  // Keyboard shortcuts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        useTemporalStore.getState().undo();
      } else if (mod && (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))) {
        e.preventDefault();
        useTemporalStore.getState().redo();
      } else if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        removeLayer(selectedId);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, removeLayer]);

  // Autosave draft (debounced).
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem("pc_draft", JSON.stringify(doc));
      } catch {}
    }, 600);
    return () => clearTimeout(id);
  }, [doc]);

  return (
    <div
      ref={wrapRef}
      className="relative grid h-full w-full place-items-center overflow-hidden p-6"
      onDragOver={(e) => {
        if (Array.from(e.dataTransfer.types).includes("Files")) {
          e.preventDefault();
          setDragOver(true);
        }
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDragOver(false);
      }}
      onDrop={onDropFile}
    >
      <div className="shadow-2xl" style={{ maxWidth: "100%", maxHeight: "100%" }}>
        {box.w > 0 && (
          <EditorStage ref={setStageRef} displayW={box.w} displayH={box.h} onRequestTextEdit={onRequestTextEdit} />
        )}
      </div>
      {dragOver && (
        <div className="pointer-events-none absolute inset-3 grid place-items-center rounded-2xl border-2 border-dashed border-brand bg-brand/5">
          <span className="rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white">Drop photo to place or fill a frame</span>
        </div>
      )}
      <div className="pointer-events-none absolute bottom-2 right-3 text-[10px] tabular-nums text-ink-soft">
        {w} x {h}
      </div>
    </div>
  );
});
