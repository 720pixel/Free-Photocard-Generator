"use client";
import { useEffect, useState } from "react";
import { Shuffle, Search, Plus, X, RotateCcw } from "lucide-react";
import type { Fill, Gradient, GradientStop } from "../../types";
import { fillToCss } from "../../render/fills";
import { ColorInput, Field, Segmented, Slider, Btn } from "../controls";

const DEFAULT_GRADIENT: Gradient = {
  type: "linear",
  angle: 135,
  stops: [
    { color: "#6d28d9", offset: 0 },
    { color: "#db2777", offset: 1 },
  ],
};

// Fade-to-transparent presets. The 8-digit hex alpha (…00) is the transparent
// end; these let one side hold colour while the other fades away.
function withAlpha(hex: string, aa: string) {
  const h = hex.replace("#", "").slice(0, 6);
  return `#${h}${aa}`;
}
const FADE_PRESETS: { label: string; make: (base: string) => Gradient }[] = [
  { label: "Left", make: (c) => ({ type: "linear", angle: 0, stops: [{ color: withAlpha(c, "ff"), offset: 0 }, { color: withAlpha(c, "00"), offset: 1 }] }) },
  { label: "Right", make: (c) => ({ type: "linear", angle: 180, stops: [{ color: withAlpha(c, "ff"), offset: 0 }, { color: withAlpha(c, "00"), offset: 1 }] }) },
  { label: "Top", make: (c) => ({ type: "linear", angle: 90, stops: [{ color: withAlpha(c, "ff"), offset: 0 }, { color: withAlpha(c, "00"), offset: 1 }] }) },
  { label: "Bottom", make: (c) => ({ type: "linear", angle: 270, stops: [{ color: withAlpha(c, "ff"), offset: 0 }, { color: withAlpha(c, "00"), offset: 1 }] }) },
  { label: "Vignette", make: (c) => ({ type: "radial", angle: 0, stops: [{ color: withAlpha(c, "00"), offset: 0 }, { color: withAlpha(c, "00"), offset: 0.55 }, { color: withAlpha(c, "cc"), offset: 1 }] }) },
  { label: "Glow", make: (c) => ({ type: "radial", angle: 0, stops: [{ color: withAlpha(c, "cc"), offset: 0 }, { color: withAlpha(c, "00"), offset: 1 }] }) },
];

interface ApiGradient {
  slug: string;
  name: string;
  kind: "linear" | "radial" | "conic";
  angle: number;
  // Free-Gradient stops carry `pos` (0..100); tolerate position/offset too.
  stops: { color: string; pos?: number; position?: number; offset?: number }[];
  css: string;
}

export function GradientEditor({ fill, onChange }: { fill: Fill; onChange: (f: Fill) => void }) {
  const g: Gradient = fill.kind === "gradient" ? fill.gradient : { type: "linear", angle: 135, stops: [{ color: "#6d28d9", offset: 0 }, { color: "#db2777", offset: 1 }] };
  const setG = (next: Partial<Gradient>) => onChange({ kind: "gradient", gradient: { ...g, ...next } });
  const setStop = (i: number, patch: Partial<GradientStop>) => {
    const stops = g.stops.map((s, idx) => (idx === i ? { ...s, ...patch } : s));
    setG({ stops });
  };

  const [results, setResults] = useState<ApiGradient[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const applyApi = (ag: ApiGradient) => {
    const raw = ag.stops;
    const stops: GradientStop[] = raw.map((s, i) => {
      const pct = s.pos ?? s.position;
      return {
        color: s.color,
        offset: s.offset ?? (pct != null ? pct / 100 : i / Math.max(1, raw.length - 1)),
      };
    });
    onChange({ kind: "gradient", gradient: { type: ag.kind ?? "linear", angle: ag.angle ?? 135, stops } });
  };

  const fetchRandom = async () => {
    setLoading(true);
    try {
      const r = await fetch("/unavailable/gradients/random?count=12");
      if (r.ok) setResults(normalize(await r.json()));
    } catch {}
    setLoading(false);
  };
  const fetchSearch = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/unavailable/gradients?tag=${encodeURIComponent(query)}&sort=likes`);
      if (r.ok) setResults(normalize(await r.json()));
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    void fetchRandom();
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-10 flex-1 rounded-lg border border-line" style={{ background: fillToCss({ kind: "gradient", gradient: g }) }} />
        <Btn onClick={() => onChange({ kind: "gradient", gradient: structuredClone(DEFAULT_GRADIENT) })} title="Reset gradient">
          <RotateCcw size={14} />
        </Btn>
      </div>
      {/* Type and Angle stacked full width so the 3-way segment and the slider
          never collide in the narrow inspector column. */}
      <Field label="Type">
        <Segmented
          value={g.type}
          options={[
            { value: "linear", label: "Linear" },
            { value: "radial", label: "Radial" },
            { value: "conic", label: "Conic" },
          ]}
          onChange={(v) => setG({ type: v as Gradient["type"] })}
        />
      </Field>
      {g.type !== "radial" && (
        <Field label={`Angle · ${Math.round(g.angle)}°`}>
          <Slider value={g.angle} min={0} max={360} onChange={(v) => setG({ angle: v })} />
        </Field>
      )}

      <div className="space-y-2">
        {g.stops.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex-1"><ColorInput value={s.color} onChange={(v) => setStop(i, { color: v })} /></div>
            <input type="range" min={0} max={1} step={0.01} value={s.offset} onChange={(e) => setStop(i, { offset: Number(e.target.value) })} className="w-20 accent-vermilion" />
            {g.stops.length > 2 && (
              <button type="button" onClick={() => setG({ stops: g.stops.filter((_, idx) => idx !== i) })} className="text-ink-soft hover:text-rose-500">
                <X size={14} />
              </button>
            )}
          </div>
        ))}
        <Btn onClick={() => setG({ stops: [...g.stops, { color: "#ffffff", offset: 1 }] })} className="w-full">
          <Plus size={14} /> Add stop
        </Btn>
      </div>

      <div>
        <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-ink-soft">Fade to transparent</p>
        <div className="grid grid-cols-6 gap-1.5">
          {FADE_PRESETS.map((p) => {
            const base = g.stops[0]?.color?.slice(0, 7) || "#111111";
            const grad = p.make(base);
            return (
              <button
                key={p.label}
                type="button"
                title={p.label}
                onClick={() => onChange({ kind: "gradient", gradient: grad })}
                className="aspect-square rounded-md border border-line transition hover:scale-105"
                style={{ background: `${fillToCss({ kind: "gradient", gradient: grad })}, repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50% / 8px 8px` }}
              />
            );
          })}
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex flex-1 items-center gap-1 rounded-lg border border-line px-2">
          <Search size={14} className="text-ink-soft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchSearch()}
            placeholder="Search gradients"
            className="w-full bg-transparent py-1.5 text-xs outline-none"
          />
        </div>
        <Btn onClick={fetchRandom} title="Random"><Shuffle size={14} /></Btn>
      </div>

      <div className="grid grid-cols-6 gap-1.5">
        {loading && <span className="col-span-6 text-center text-xs text-ink-soft">Loading...</span>}
        {results.map((ag) => (
          <button
            key={ag.slug}
            type="button"
            title={ag.name}
            onClick={() => applyApi(ag)}
            className="aspect-square rounded-md border border-line transition hover:scale-105"
            style={{ background: ag.css || `linear-gradient(${ag.angle}deg, ${ag.stops.map((s) => s.color).join(",")})` }}
          />
        ))}
      </div>
    </div>
  );
}

function normalize(data: unknown): ApiGradient[] {
  const arr = Array.isArray(data) ? data : (data as { gradients?: unknown[]; data?: unknown[] })?.gradients ?? (data as { data?: unknown[] })?.data ?? [];
  return (arr as ApiGradient[]).filter((g) => g && Array.isArray(g.stops));
}
