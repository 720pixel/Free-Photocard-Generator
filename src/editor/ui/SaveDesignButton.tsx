"use client";

import { useState } from "react";
import { Save, Loader2, Check, X } from "lucide-react";
import { useEditor } from "@/editor/store";
import { docDimensions } from "@/editor/types";
import { presetByKey } from "@/lib/presets";
import { saveDesign } from "@/editor/savedDesigns";
import type { StageHandle } from "@/editor/render/Stage";

type Phase = "idle" | "naming" | "saving" | "saved";

const THUMB_W = 240;

export default function SaveDesignButton({ stageRef }: { stageRef: React.RefObject<StageHandle | null> }) {
  const doc = useEditor((s) => s.doc);
  const [phase, setPhase] = useState<Phase>("idle");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function begin() {
    setError(null);
    setName("");
    setPhase("naming");
  }

  async function thumbnail(): Promise<Blob | null> {
    const handle = stageRef.current;
    if (!handle) return null;
    try {
      const { w, h } = docDimensions(doc, presetByKey);
      return await handle.exportBlob({ w: THUMB_W, h: Math.round((THUMB_W * h) / w), format: "jpeg", quality: 0.8 });
    } catch {
      return null;
    }
  }

  async function save() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Give your design a name.");
      return;
    }
    setError(null);
    setPhase("saving");
    try {
      await saveDesign(trimmed.slice(0, 120), doc, await thumbnail());
      setPhase("saved");
      setTimeout(() => setPhase("idle"), 2000);
    } catch {
      setError("Could not save. Browser storage may be full or disabled.");
      setPhase("naming");
    }
  }

  if (phase === "naming" || phase === "saving") {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") setPhase("idle");
            }}
            placeholder="Design name"
            autoFocus
            maxLength={120}
            disabled={phase === "saving"}
            className="w-40 rounded-sm border border-line bg-paper px-3 py-1.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 disabled:opacity-60"
          />
          <button
            type="button"
            onClick={save}
            disabled={phase === "saving"}
            aria-label="Save design"
            className="inline-flex items-center justify-center gap-1.5 rounded-sm bg-brand px-3 py-1.5 text-sm font-bold text-paper transition hover:opacity-90 disabled:opacity-60"
          >
            {phase === "saving" ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            ) : (
              <Save className="h-4 w-4" strokeWidth={2} />
            )}
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setPhase("idle");
              setError(null);
            }}
            aria-label="Cancel"
            className="inline-flex items-center justify-center rounded-sm border border-line px-2 py-1.5 text-ink-soft transition hover:text-ink"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  if (phase === "saved") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-sm border border-line bg-panel px-3 py-1.5 text-sm font-bold text-brand">
        <Check className="h-4 w-4" strokeWidth={2} />
        Saved
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={begin}
      disabled={doc.layers.length === 0}
      className="inline-flex items-center gap-1.5 rounded-sm border border-line bg-panel px-3 py-1.5 text-sm font-bold text-ink transition hover:border-brand hover:text-brand disabled:opacity-50 disabled:hover:border-line disabled:hover:text-ink"
    >
      <Save className="h-4 w-4" strokeWidth={2} />
      Save
    </button>
  );
}
