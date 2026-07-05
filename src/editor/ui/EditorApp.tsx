"use client";
import { useEffect, useRef, useState } from "react";
import {
  LayoutTemplate,
  Layers as LayersIcon,
  SlidersHorizontal,
  AlignCenterHorizontal,
  AlignCenterVertical,
  BringToFront,
  SendToBack,
  Copy,
  Trash2,
  Sparkles,
} from "lucide-react";
import { useEditor } from "../store";
import { templateById, instantiate, TEMPLATES } from "../templates";
import { presetByKey, SIZE_PRESETS, type SizeKey } from "@/lib/presets";
import { docDimensions } from "../types";
import type { StageHandle } from "../render/Stage";
import { Toolbar } from "./Toolbar";
import { Canvas } from "./Canvas";
import { TemplatesPanel } from "./panels/TemplatesPanel";
import { LayersPanel } from "./panels/LayersPanel";
import { Inspector } from "./panels/Inspector";
import { renderTemplateSvg } from "../render/svgPreview";

type LeftTab = "templates" | "layers";

export function EditorApp({ initialTemplate, initialSaved, initialSize }: { initialTemplate?: string; initialSaved?: string; initialSize?: string }) {
  const stageRef = useRef<StageHandle | null>(null);
  const [leftTab, setLeftTab] = useState<LeftTab>("templates");
  const [mobilePanel, setMobilePanel] = useState<"none" | "left" | "right">("none");
  const loadTemplate = useEditor((s) => s.loadTemplate);
  const setSize = useEditor((s) => s.setSize);
  const reset = useEditor((s) => s.reset);
  const select = useEditor((s) => s.select);
  const doc = useEditor((s) => s.doc);
  const selectedId = useEditor((s) => s.selectedId);
  const hasContent = doc.layers.length > 0;

  useEffect(() => {
    if (initialSaved) {
      fetch(`/unavailable/templates/${initialSaved}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((row) => {
          if (row?.design?.layers) {
            loadTemplate(row.design);
            setLeftTab("layers");
          }
        })
        .catch(() => {});
      return;
    }
    if (initialTemplate) {
      const def = templateById(initialTemplate);
      if (def) {
        const p = presetByKey("1080x1350");
        loadTemplate(instantiate(def, "1080x1350", p.w, p.h));
        setLeftTab("layers");
        return;
      }
    }
    // Open a blank canvas directly at a requested size preset. Stash any current
    // work first (recoverable), then reset so this really is a blank canvas — the
    // store survives client-side navigation, so previous layers would otherwise
    // carry over.
    if (initialSize && SIZE_PRESETS.some((p) => p.key === initialSize)) {
      try {
        const draft = localStorage.getItem("pc_draft");
        const parsed = draft ? JSON.parse(draft) : null;
        const live = useEditor.getState().doc;
        const work = live.layers.length ? live : parsed?.layers?.length ? parsed : null;
        if (work) {
          const list = JSON.parse(localStorage.getItem("pc_drafts") || "[]");
          list.unshift({ ts: Date.now(), doc: work });
          localStorage.setItem("pc_drafts", JSON.stringify(list.slice(0, 10)));
        }
        localStorage.removeItem("pc_draft");
      } catch {}
      reset();
      const p = presetByKey(initialSize as SizeKey);
      setSize(initialSize as SizeKey, p.w, p.h);
      return;
    }
    try {
      const draft = localStorage.getItem("pc_draft");
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed?.layers?.length) loadTemplate(parsed);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestTextEdit = (id: string) => {
    select(id);
    setMobilePanel("right");
  };

  const pickTemplate = (id: string) => {
    const def = templateById(id);
    if (!def) return;
    const p = presetByKey("1080x1350");
    loadTemplate(instantiate(def, "1080x1350", p.w, p.h));
    setLeftTab("layers");
  };

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-paper">
      <Toolbar stageRef={stageRef} />
      <div className="relative flex min-h-0 flex-1">
        {/* Left rail */}
        <aside
          className={`panel absolute z-20 flex h-full w-72 flex-col md:relative md:z-0 md:flex ${
            mobilePanel === "left" ? "flex" : "hidden md:flex"
          }`}
        >
          <div className="flex border-b border-line">
            <TabBtn active={leftTab === "templates"} onClick={() => setLeftTab("templates")}>
              <LayoutTemplate size={15} /> Templates
            </TabBtn>
            <TabBtn active={leftTab === "layers"} onClick={() => setLeftTab("layers")}>
              <LayersIcon size={15} /> Layers
            </TabBtn>
          </div>
          <div className="min-h-0 flex-1">{leftTab === "templates" ? <TemplatesPanel /> : <LayersPanel />}</div>
        </aside>

        {/* Canvas + overlays */}
        <main className="relative min-w-0 flex-1">
          <Canvas ref={stageRef} onRequestTextEdit={requestTextEdit} />
          {selectedId && <SelectionBar />}
          {!hasContent && <EmptyState onPick={pickTemplate} onBrowse={() => { setLeftTab("templates"); setMobilePanel("left"); }} />}
        </main>

        {/* Right inspector */}
        <aside
          className={`panel absolute right-0 z-20 h-full w-80 overflow-y-auto md:relative md:z-0 ${
            mobilePanel === "right" ? "block" : "hidden md:block"
          }`}
        >
          <Inspector />
        </aside>

        {/* Mobile toggles */}
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 gap-2 md:hidden">
          <MobileToggle label="Design" onClick={() => setMobilePanel(mobilePanel === "left" ? "none" : "left")}>
            <LayoutTemplate size={16} />
          </MobileToggle>
          <MobileToggle label="Edit" onClick={() => setMobilePanel(mobilePanel === "right" ? "none" : "right")}>
            <SlidersHorizontal size={16} />
          </MobileToggle>
        </div>
      </div>
    </div>
  );
}

function SelectionBar() {
  const selectedId = useEditor((s) => s.selectedId)!;
  const doc = useEditor((s) => s.doc);
  const move = useEditor((s) => s.moveLayer);
  const dup = useEditor((s) => s.duplicateLayer);
  const remove = useEditor((s) => s.removeLayer);
  const update = useEditor((s) => s.updateLayer);
  const layer = doc.layers.find((l) => l.id === selectedId);
  if (!layer) return null;
  const { w, h } = docDimensions(doc, presetByKey);
  const centerH = () => update(selectedId, { x: (w - layer.width) / 2 });
  const centerV = () => update(selectedId, { y: (h - layer.height) / 2 });

  return (
    <div className="absolute left-1/2 top-3 z-10 flex -translate-x-1/2 items-center gap-0.5 rounded-xl border border-line bg-panel/95 p-1 shadow-lg backdrop-blur">
      <BarBtn title="Center horizontally" onClick={centerH}><AlignCenterVertical size={16} /></BarBtn>
      <BarBtn title="Center vertically" onClick={centerV}><AlignCenterHorizontal size={16} /></BarBtn>
      <span className="mx-0.5 h-5 w-px bg-line" />
      <BarBtn title="Bring to front" onClick={() => move(selectedId, "top")}><BringToFront size={16} /></BarBtn>
      <BarBtn title="Send to back" onClick={() => move(selectedId, "bottom")}><SendToBack size={16} /></BarBtn>
      <span className="mx-0.5 h-5 w-px bg-line" />
      <BarBtn title="Duplicate" onClick={() => dup(selectedId)}><Copy size={16} /></BarBtn>
      <BarBtn title="Delete" onClick={() => remove(selectedId)} danger><Trash2 size={16} /></BarBtn>
    </div>
  );
}

function BarBtn({ children, onClick, title, danger }: { children: React.ReactNode; onClick: () => void; title: string; danger?: boolean }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`grid h-9 w-9 place-items-center rounded-lg transition hover:bg-line ${danger ? "text-vermilion" : "text-ink-soft hover:text-ink"}`}
    >
      {children}
    </button>
  );
}

function EmptyState({ onPick, onBrowse }: { onPick: (id: string) => void; onBrowse: () => void }) {
  const quick = TEMPLATES.slice(0, 6);
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center p-6">
      <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-line bg-panel/95 p-6 text-center shadow-xl backdrop-blur">
        <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-xl bg-vermilion text-white">
          <Sparkles size={20} />
        </div>
        <h2 className="font-display text-lg font-bold">Start with a template</h2>
        <p className="mt-1 text-sm text-ink-soft">Pick a design, swap the photo and headline, export. Under a minute.</p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {quick.map((t) => {
            const svg = renderTemplateSvg(
              { schemaVersion: 1, templateId: t.id, size: "1080x1350", customW: 240, customH: 300, ...t.build(240, 300) },
              240,
              300,
            );
            return (
              <button
                key={t.id}
                onClick={() => onPick(t.id)}
                title={t.name}
                className="aspect-[4/5] overflow-hidden rounded-lg border border-line bg-white transition hover:border-vermilion hover:shadow-md"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            );
          })}
        </div>
        <button onClick={onBrowse} className="mt-4 w-full rounded-lg brand-gradient py-2.5 text-sm font-semibold text-white">
          Browse all templates
        </button>
      </div>
    </div>
  );
}

function TabBtn({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition ${
        active ? "border-b-2 border-vermilion text-ink" : "text-ink-soft"
      }`}
    >
      {children}
    </button>
  );
}

function MobileToggle({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-xs font-semibold text-paper shadow-lg"
    >
      {children}
      {label}
    </button>
  );
}
