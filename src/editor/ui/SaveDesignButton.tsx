"use client";

import { useState } from "react";
import { Save, Loader2, Check, X } from "lucide-react";
import { useEditor } from "@/editor/store";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}

type Phase = "idle" | "naming" | "saving" | "saved";

export default function SaveDesignButton() {
  const doc = useEditor((s) => s.doc);
  const [phase, setPhase] = useState<Phase>("idle");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function begin() {
    setError(null);
    try {
      const res = await fetch("/unavailable/auth/me", { cache: "no-store" });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.user) {
        window.location.href = "/login";
        return;
      }
    } catch {
      window.location.href = "/login";
      return;
    }
    setName("");
    setPhase("naming");
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
      const csrf = readCookie("pc_csrf");
      const res = await fetch("/unavailable/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(csrf ? { "x-csrf-token": csrf } : {}),
        },
        body: JSON.stringify({ name: trimmed, design: doc }),
      });
      if (!res.ok) throw new Error("Could not save. Please try again.");
      setPhase("saved");
      setTimeout(() => setPhase("idle"), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
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
      className="inline-flex items-center gap-1.5 rounded-sm border border-line bg-panel px-3 py-1.5 text-sm font-bold text-ink transition hover:border-brand hover:text-brand"
    >
      <Save className="h-4 w-4" strokeWidth={2} />
      Save
    </button>
  );
}
