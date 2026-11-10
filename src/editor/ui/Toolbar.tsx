"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Undo2, Redo2, Download, Home, Loader2, ChevronDown, RotateCcw } from "lucide-react";
import { useEditor, useTemporalStore } from "../store";
import { SIZE_PRESETS, presetByKey, CUSTOM_MIN, CUSTOM_MAX, type SizeKey } from "@/lib/presets";
import { docDimensions } from "../types";
import type { StageHandle } from "../render/Stage";
import { captureTelemetry, downloadBlob, exportFilename, runExport } from "./export";
import { IconBtn } from "./controls";
import { ThemeSwap } from "./ThemeSwap";
import SaveDesignButton from "./SaveDesignButton";
import LogoMark from "@/components/LogoMark";

export function Toolbar({ stageRef }: { stageRef: React.RefObject<StageHandle | null> }) {
  const doc = useEditor((s) => s.doc);
  const setSize = useEditor((s) => s.setSize);
  const reset = useEditor((s) => s.reset);
  const [busy, setBusy] = useState(false);

  const doReset = () => {
    if (doc.layers.length === 0 || confirm("Reset the canvas? This clears all layers and the saved draft.")) {
      reset();
      useTemporalStore.getState().clear();
      try {
        localStorage.removeItem("pc_draft");
      } catch {}
    }
  };
  const [format, setFormat] = useState<"png" | "jpeg">("png");
  const [quality, setQuality] = useState(0.92);
  const [open, setOpen] = useState(false);

  const doExport = async () => {
    const handle = stageRef.current;
    if (!handle) return;
    setBusy(true);
    try {
      const { w, h } = docDimensions(doc, presetByKey);
      const blob = await runExport(handle, doc, { w, h }, format, quality);
      const sizeLabel = doc.size === "custom" ? `${w}x${h}` : doc.size;
      downloadBlob(blob, exportFilename(doc, format, sizeLabel));
      void captureTelemetry(blob, doc, sizeLabel, format, { w, h });
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  return (
    <header className="flex flex-wrap items-center gap-2 border-b border-line bg-panel/85 px-3 py-2 backdrop-blur-md">
      {/* masthead */}
      <Link href="/" className="group flex items-center gap-2" title="Home">
        <LogoMark size={32} className="rounded-[7px]" />
        <span className="hidden font-display text-[15px] font-bold tracking-tight sm:block">
          Photocard<span className="text-vermilion">.</span>
        </span>
      </Link>

      <div className="mx-1 hidden h-6 w-px bg-line sm:block" />

      {/* size preset */}
      <div className="relative">
        <select
          value={doc.size}
          onChange={(e) => {
            const v = e.target.value as SizeKey | "custom";
            if (v === "custom") setSize("custom", doc.customW, doc.customH);
            else {
              const p = presetByKey(v as SizeKey);
              setSize(v, p.w, p.h);
            }
          }}
          className="appearance-none rounded-lg border border-line bg-panel py-1.5 pl-2.5 pr-7 font-mono text-xs"
        >
          {SIZE_PRESETS.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label} · {p.w}x{p.h}
            </option>
          ))}
          <option value="custom">Custom</option>
        </select>
        <ChevronDown size={13} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ink-soft" />
      </div>

      {doc.size === "custom" && (
        <div className="flex items-center gap-1 font-mono text-xs">
          <DimInput value={doc.customW} onCommit={(v) => setSize("custom", v, doc.customH)} />
          <span className="text-ink-soft">×</span>
          <DimInput value={doc.customH} onCommit={(v) => setSize("custom", doc.customW, v)} />
        </div>
      )}

      <div className="mx-1 h-6 w-px bg-line" />
      <IconBtn title="Undo (Ctrl+Z)" onClick={() => useTemporalStore.getState().undo()}><Undo2 size={16} /></IconBtn>
      <IconBtn title="Redo (Ctrl+Y)" onClick={() => useTemporalStore.getState().redo()}><Redo2 size={16} /></IconBtn>
      <IconBtn title="Reset canvas" onClick={doReset}><RotateCcw size={16} /></IconBtn>

      <div className="ml-auto flex items-center gap-2">
        <SaveDesignButton stageRef={stageRef} />
        <ThemeSwap />
        {open && (
          <div className="flex items-center gap-2 rounded-lg border border-line bg-panel px-2 py-1">
            <select value={format} onChange={(e) => setFormat(e.target.value as "png" | "jpeg")} className="bg-panel font-mono text-xs">
              <option value="png">PNG</option>
              <option value="jpeg">JPG</option>
            </select>
            {format === "jpeg" && (
              <input type="range" min={0.5} max={1} step={0.02} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-16 accent-vermilion" />
            )}
          </div>
        )}
        <button
          type="button"
          onClick={() => (open ? doExport() : setOpen(true))}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg brand-gradient px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 disabled:opacity-60"
        >
          {busy ? <><Loader2 size={15} className="animate-spin" /> Exporting</> : <><Download size={15} /> {open ? "Download" : "Export"}</>}
        </button>
      </div>
    </header>
  );
}

function DimInput({ value, onCommit }: { value: number; onCommit: (v: number) => void }) {
  const [text, setText] = useState(String(value));
  const [focused, setFocused] = useState(false);
  // Keep in sync when the value changes elsewhere (preset switch, reflow), but
  // never clobber what the user is actively typing.
  useEffect(() => {
    if (!focused) setText(String(value));
  }, [value, focused]);
  const commit = () => {
    setFocused(false);
    const n = Math.round(Number(text));
    if (!Number.isFinite(n) || n <= 0) return setText(String(value));
    const clamped = Math.min(CUSTOM_MAX, Math.max(CUSTOM_MIN, n));
    setText(String(clamped));
    if (clamped !== value) onCommit(clamped);
  };
  return (
    <input
      value={text}
      inputMode="numeric"
      onFocus={() => setFocused(true)}
      onChange={(e) => setText(e.target.value.replace(/[^0-9]/g, ""))}
      onBlur={commit}
      onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
      className="w-14 rounded-md border border-line bg-panel px-1.5 py-1 text-center outline-none focus:border-vermilion"
    />
  );
}
