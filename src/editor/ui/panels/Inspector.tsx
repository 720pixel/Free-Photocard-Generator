"use client";
import { useRef, useState } from "react";
import { Palette, Sparkles, Trash2, Upload, Copy, BringToFront, SendToBack, MonitorSmartphone } from "lucide-react";
import { useEditor } from "../../store";
import { BLEND_MODES, FILTER_PRESETS, type ImageLayer, type TextLayer, type Fill } from "../../types";
import { FONTS, getLocalFonts, isLocalFontsSupported, loadFont, loadLocalFonts } from "../../fonts";
import { ingestImage } from "../../ingest";
import { asGradientFrom, asSolidFrom, DEFAULT_TEXT_BG } from "../../factories";
import { TEXTURES, textureDataUrl, textureFullDataUrl, textureIsCover } from "../../textures";
import { FRAMES, framePreviewSvg, makeFrameSpec } from "../../frames";
import { FRAME_SHAPES, frameShapeSvg } from "../../frameShapes";
import type { ShapeLayer, TextureSpec } from "../../types";
import { Btn, ColorInput, Field, Segmented, Slider } from "../controls";
import { GradientEditor } from "./GradientEditor";

export function Inspector() {
  const doc = useEditor((s) => s.doc);
  const selectedId = useEditor((s) => s.selectedId);
  const selected = doc.layers.find((l) => l.id === selectedId) ?? null;

  if (!selected) return <BackgroundInspector />;
  if (selected.type === "text") return <TextInspector layer={selected} />;
  if (selected.type === "image" || selected.type === "logo") return <ImageInspector layer={selected} />;
  return <ShapeInspector layer={selected as import("../../types").ShapeLayer} />;
}

function PanelWrap({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4 p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function LayerActions({ id }: { id: string }) {
  const removeLayer = useEditor((s) => s.removeLayer);
  const duplicateLayer = useEditor((s) => s.duplicateLayer);
  const moveLayer = useEditor((s) => s.moveLayer);
  return (
    <div className="space-y-2 border-t border-line pt-3">
      <div className="flex gap-2">
        <Btn onClick={() => moveLayer(id, "top")} className="flex-1" title="Bring to front">
          <BringToFront size={14} /> Front
        </Btn>
        <Btn onClick={() => moveLayer(id, "bottom")} className="flex-1" title="Send to back">
          <SendToBack size={14} /> Back
        </Btn>
      </div>
      <div className="flex gap-2">
        <Btn onClick={() => duplicateLayer(id)} className="flex-1">
          <Copy size={14} /> Duplicate
        </Btn>
        <Btn onClick={() => removeLayer(id)} className="flex-1 text-vermilion">
          <Trash2 size={14} /> Delete
        </Btn>
      </div>
    </div>
  );
}

// ---- Text ------------------------------------------------------------------
function TextInspector({ layer }: { layer: TextLayer }) {
  const update = useEditor((s) => s.updateLayer);
  const set = (patch: Partial<TextLayer>) => update(layer.id, patch);
  const [local, setLocal] = useState<string[]>(getLocalFonts());
  const [localMsg, setLocalMsg] = useState<string | null>(null);

  const setFont = (family: string) => {
    void loadFont(family);
    set({ fontFamily: family });
  };
  const useDeviceFonts = async () => {
    try {
      const fams = await loadLocalFonts();
      setLocal(fams);
      setLocalMsg(fams.length ? `${fams.length} device fonts added` : "No device fonts found");
    } catch (e) {
      setLocalMsg((e as Error).message);
    }
  };

  return (
    <PanelWrap title="Text">
      <Field label="Text">
        <textarea
          value={layer.text}
          onChange={(e) => set({ text: e.target.value })}
          rows={3}
          className="w-full resize-none rounded-lg border border-line bg-transparent p-2 text-sm"
        />
      </Field>
      <Field label="Font">
        <select
          value={layer.fontFamily}
          onChange={(e) => setFont(e.target.value)}
          className="w-full rounded-lg border border-line bg-transparent px-2 py-1.5 text-sm"
        >
          <optgroup label="Bengali">
            {FONTS.filter((f) => f.bengali).map((f, i) => (
              <option key={f.family + i} value={f.family}>
                {f.family}
              </option>
            ))}
          </optgroup>
          <optgroup label="English">
            {FONTS.filter((f) => !f.bengali).map((f) => (
              <option key={f.family} value={f.family}>
                {f.family}
              </option>
            ))}
          </optgroup>
          {local.length > 0 && (
            <optgroup label="Device fonts">
              {local.map((fam) => (
                <option key={"local-" + fam} value={fam}>
                  {fam}
                </option>
              ))}
            </optgroup>
          )}
        </select>
        {isLocalFontsSupported() && (
          <button type="button" onClick={useDeviceFonts} className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-ink-soft hover:text-brand">
            <MonitorSmartphone size={12} /> Use device fonts
          </button>
        )}
        {localMsg && <span className="mt-1 block text-[11px] text-ink-soft">{localMsg}</span>}
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Size">
          <Slider value={layer.fontSize} min={12} max={220} onChange={(v) => set({ fontSize: v, autoFit: false })} />
        </Field>
        <Field label="Weight">
          <Segmented
            value={String(layer.fontWeight)}
            options={[
              { value: "400", label: "R" },
              { value: "600", label: "M" },
              { value: "700", label: "B" },
              { value: "800", label: "X" },
            ]}
            onChange={(v) => set({ fontWeight: Number(v) })}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Line height">
          <Slider value={layer.lineHeight} min={0.8} max={2.4} step={0.05} onChange={(v) => set({ lineHeight: v })} />
        </Field>
        <Field label="Letter spacing">
          <Slider value={layer.letterSpacing} min={-5} max={30} onChange={(v) => set({ letterSpacing: v })} />
        </Field>
      </div>
      <Field label="Color">
        <ColorInput value={layer.fill} onChange={(v) => set({ fill: v })} />
      </Field>

      <details className="rounded-lg border border-line p-2" open={!!layer.bg?.enabled}>
        <summary className="cursor-pointer text-xs font-medium text-ink-soft">Text background</summary>
        <div className="mt-3 space-y-3">
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={!!layer.bg?.enabled}
              onChange={(e) => set({ bg: e.target.checked ? { ...DEFAULT_TEXT_BG, ...(layer.bg ?? {}), enabled: true } : { ...(layer.bg ?? DEFAULT_TEXT_BG), enabled: false } })}
            />
            Enable background
          </label>
          {layer.bg?.enabled && (
            <>
              <Field label="Color"><ColorInput value={layer.bg.color} onChange={(v) => set({ bg: { ...layer.bg!, color: v } })} /></Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label={`Opacity`}><Slider value={layer.bg.opacity} min={0} max={1} step={0.02} onChange={(v) => set({ bg: { ...layer.bg!, opacity: v } })} /></Field>
                <Field label={`Radius`}><Slider value={layer.bg.radius} min={0} max={40} onChange={(v) => set({ bg: { ...layer.bg!, radius: v } })} /></Field>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label={`Pad X`}><Slider value={layer.bg.padX} min={0} max={60} onChange={(v) => set({ bg: { ...layer.bg!, padX: v } })} /></Field>
                <Field label={`Pad Y`}><Slider value={layer.bg.padY} min={0} max={40} onChange={(v) => set({ bg: { ...layer.bg!, padY: v } })} /></Field>
              </div>
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={layer.bg.perLine} onChange={(e) => set({ bg: { ...layer.bg!, perLine: e.target.checked } })} /> Band per line
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={layer.bg.frost} onChange={(e) => set({ bg: { ...layer.bg!, frost: e.target.checked, blur: e.target.checked ? (layer.bg!.blur || 16) : 0 } })} /> Frosted / blurred
              </label>
              {(layer.bg.frost || (layer.bg.blur ?? 0) > 0) && (
                <Field label={`Blur · ${Math.round(layer.bg.blur ?? 16)}`}>
                  <Slider value={layer.bg.blur ?? 16} min={0} max={60} onChange={(v) => set({ bg: { ...layer.bg!, blur: v, frost: v > 0 } })} />
                </Field>
              )}
            </>
          )}
        </div>
      </details>

      <Field label="Align">
        <Segmented
          value={layer.align}
          options={[
            { value: "left", label: "◧" },
            { value: "center", label: "▣" },
            { value: "right", label: "◨" },
          ]}
          onChange={(v) => set({ align: v as TextLayer["align"] })}
        />
      </Field>

      <details className="rounded-lg border border-line p-2">
        <summary className="cursor-pointer text-xs font-medium text-ink-soft">Stroke & shadow</summary>
        <div className="mt-3 space-y-3">
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={layer.stroke.enabled} onChange={(e) => set({ stroke: { ...layer.stroke, enabled: e.target.checked } })} />
            Outline
          </label>
          {layer.stroke.enabled && (
            <>
              <Slider value={layer.stroke.width} min={0.5} max={20} step={0.5} onChange={(v) => set({ stroke: { ...layer.stroke, width: v } })} />
              <ColorInput value={layer.stroke.color} onChange={(v) => set({ stroke: { ...layer.stroke, color: v } })} />
            </>
          )}
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={layer.shadow.enabled} onChange={(e) => set({ shadow: { ...layer.shadow, enabled: e.target.checked } })} />
            Shadow
          </label>
          {layer.shadow.enabled && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <Slider value={layer.shadow.x} min={-40} max={40} onChange={(v) => set({ shadow: { ...layer.shadow, x: v } })} />
                <Slider value={layer.shadow.y} min={-40} max={40} onChange={(v) => set({ shadow: { ...layer.shadow, y: v } })} />
              </div>
              <Slider value={layer.shadow.blur} min={0} max={60} onChange={(v) => set({ shadow: { ...layer.shadow, blur: v } })} />
              <ColorInput value={layer.shadow.color} onChange={(v) => set({ shadow: { ...layer.shadow, color: v } })} />
            </>
          )}
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={layer.glow.enabled} onChange={(e) => set({ glow: { ...layer.glow, enabled: e.target.checked } })} />
            Glow
          </label>
          {layer.glow.enabled && (
            <>
              <Slider value={layer.glow.strength} min={0} max={60} onChange={(v) => set({ glow: { ...layer.glow, strength: v } })} />
              <ColorInput value={layer.glow.color} onChange={(v) => set({ glow: { ...layer.glow, color: v } })} />
            </>
          )}
        </div>
      </details>

      <label className="flex items-center gap-2 text-xs">
        <input type="checkbox" checked={layer.autoFit} onChange={(e) => set({ autoFit: e.target.checked })} />
        Auto-fit to box
      </label>
      <LayerActions id={layer.id} />
    </PanelWrap>
  );
}

// ---- Image / Logo ----------------------------------------------------------
function ImageInspector({ layer }: { layer: ImageLayer }) {
  const update = useEditor((s) => s.updateLayer);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = (patch: Partial<ImageLayer>) => update(layer.id, patch);
  const setAdj = (patch: Partial<ImageLayer["adjustments"]>) =>
    update(layer.id, { adjustments: { ...layer.adjustments, ...patch } });

  const onFile = async (f: File | null) => {
    if (!f) return;
    try {
      const { dataUrl, width, height } = await ingestImage(f);
      set({ src: dataUrl, naturalWidth: width, naturalHeight: height });
    } catch (e) {
      alert((e as Error).message);
    }
  };

  return (
    <PanelWrap title={layer.type === "logo" ? "Logo" : "Photo"}>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
      <Btn onClick={() => fileRef.current?.click()} className="w-full">
        <Upload size={14} /> {layer.src ? "Replace photo" : "Upload"}
      </Btn>

      <Field label="Fit">
        <Segmented
          value={layer.fit}
          options={[
            { value: "cover", label: "Cover" },
            { value: "contain", label: "Contain" },
          ]}
          onChange={(v) => set({ fit: v as ImageLayer["fit"] })}
        />
      </Field>
      <Field label="Frame shape">
        <div className="grid grid-cols-7 gap-1">
          {FRAME_SHAPES.map((fr) => {
            const active = layer.mask === fr.id;
            const box = frameShapeSvg(fr.id);
            return (
              <button
                key={fr.id}
                title={fr.label}
                onClick={() => set({ mask: fr.id as ImageLayer["mask"], cornerRadius: fr.id === "rounded" && layer.cornerRadius === 0 ? 24 : layer.cornerRadius })}
                className={`grid aspect-square place-items-center rounded-md border p-1 transition ${active ? "border-brand ring-1 ring-brand text-brand" : "border-line text-ink-soft hover:border-brand"}`}
                dangerouslySetInnerHTML={{ __html: box }}
              />
            );
          })}
        </div>
      </Field>
      {layer.mask === "rounded" && (
        <Field label="Corner radius">
          <Slider value={layer.cornerRadius} min={0} max={200} onChange={(v) => set({ cornerRadius: v })} />
        </Field>
      )}
      <Field label="Zoom / pan">
        <Slider value={layer.zoom} min={1} max={3} step={0.02} onChange={(v) => set({ zoom: v })} />
        <div className="mt-1 grid grid-cols-2 gap-2">
          <Slider value={layer.offsetX} min={0} max={1} step={0.01} onChange={(v) => set({ offsetX: v })} />
          <Slider value={layer.offsetY} min={0} max={1} step={0.01} onChange={(v) => set({ offsetY: v })} />
        </div>
      </Field>

      <Field label="Filter preset">
        <div className="flex flex-wrap gap-1.5">
          {Object.keys(FILTER_PRESETS).map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => set({ filterPreset: name, adjustments: { ...FILTER_PRESETS[name] } })}
              className="rounded-md border border-line px-2 py-1 text-[11px] hover:border-brand"
            >
              {name}
            </button>
          ))}
        </div>
      </Field>

      <details className="rounded-lg border border-line p-2">
        <summary className="cursor-pointer text-xs font-medium text-ink-soft">
          <Sparkles size={12} className="mr-1 inline" /> Adjustments
        </summary>
        <div className="mt-3 space-y-2">
          <Field label="Brightness"><Slider value={layer.adjustments.brightness} min={-1} max={1} step={0.02} onChange={(v) => setAdj({ brightness: v })} /></Field>
          <Field label="Contrast"><Slider value={layer.adjustments.contrast} min={-100} max={100} onChange={(v) => setAdj({ contrast: v })} /></Field>
          <Field label="Saturation"><Slider value={layer.adjustments.saturation} min={-2} max={10} step={0.1} onChange={(v) => setAdj({ saturation: v })} /></Field>
          <Field label="Hue"><Slider value={layer.adjustments.hue} min={0} max={360} onChange={(v) => setAdj({ hue: v })} /></Field>
          <Field label="Blur"><Slider value={layer.adjustments.blur} min={0} max={40} onChange={(v) => setAdj({ blur: v })} /></Field>
        </div>
      </details>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Opacity"><Slider value={layer.opacity} min={0} max={1} step={0.02} onChange={(v) => set({ opacity: v })} /></Field>
        <Field label="Blend">
          <select value={layer.blend} onChange={(e) => set({ blend: e.target.value as ImageLayer["blend"] })} className="w-full rounded-lg border border-line bg-transparent px-2 py-1.5 text-xs">
            {BLEND_MODES.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </Field>
      </div>

      <details className="rounded-lg border border-line p-2" open>
        <summary className="cursor-pointer text-xs font-medium text-ink-soft">Frames & borders</summary>
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-4 gap-1.5">
            {FRAMES.map((fr) => {
              const active = (layer.frame?.style ?? "none") === fr.id;
              const svg = framePreviewSvg(fr.id, layer.frame?.color ?? fr.defaults?.color ?? "#1c1917", layer.frame?.color2 ?? fr.defaults?.color2 ?? "#ffffff");
              return (
                <button
                  key={fr.id}
                  title={fr.label}
                  onClick={() => set({ frame: fr.id === "none" ? null : makeFrameSpec(fr.id) })}
                  className={`aspect-square overflow-hidden rounded-md border bg-white transition ${active ? "border-brand ring-1 ring-brand" : "border-line hover:border-brand"}`}
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
              );
            })}
          </div>
          {layer.frame && (
            <>
              <Field label={`Thickness · ${Math.round(layer.frame.width)}px`}>
                <Slider value={layer.frame.width} min={2} max={80} onChange={(v) => set({ frame: { ...layer.frame!, width: v } })} />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Color"><ColorInput value={layer.frame.color} onChange={(v) => set({ frame: { ...layer.frame!, color: v } })} /></Field>
                <Field label="Accent"><ColorInput value={layer.frame.color2} onChange={(v) => set({ frame: { ...layer.frame!, color2: v } })} /></Field>
              </div>
            </>
          )}
        </div>
      </details>

      <RetouchControls layer={layer} />

      <details className="rounded-lg border border-line p-2">
        <summary className="cursor-pointer text-xs font-medium text-ink-soft">Plain border & gradient overlay</summary>
        <div className="mt-3 space-y-3">
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={layer.stroke.enabled} onChange={(e) => set({ stroke: { ...layer.stroke, enabled: e.target.checked } })} /> Border
          </label>
          {layer.stroke.enabled && (
            <>
              <Slider value={layer.stroke.width} min={1} max={30} onChange={(v) => set({ stroke: { ...layer.stroke, width: v } })} />
              <ColorInput value={layer.stroke.color} onChange={(v) => set({ stroke: { ...layer.stroke, color: v } })} />
            </>
          )}
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={!!layer.overlay}
              onChange={(e) =>
                set({ overlay: e.target.checked ? { fill: { kind: "gradient", gradient: { type: "linear", angle: 90, stops: [{ color: "#00000000", offset: 0 }, { color: "#000000cc", offset: 1 }] } }, blend: "normal", opacity: 0.6 } : null })
              }
            />
            Gradient overlay
          </label>
          {layer.overlay && (
            <>
              <GradientEditor fill={layer.overlay.fill} onChange={(fill) => set({ overlay: { ...layer.overlay!, fill } })} />
              <Slider value={layer.overlay.opacity} min={0} max={1} step={0.02} onChange={(v) => set({ overlay: { ...layer.overlay!, opacity: v } })} />
            </>
          )}
        </div>
      </details>

      <LayerActions id={layer.id} />
    </PanelWrap>
  );
}

// ---- Retouch (blur / mosaic pen + region) ----------------------------------
function RetouchControls({ layer }: { layer: ImageLayer }) {
  const active = useEditor((s) => s.retouchActive);
  const tool = useEditor((s) => s.retouchTool);
  const brush = useEditor((s) => s.retouchBrush);
  const setActive = useEditor((s) => s.setRetouchActive);
  const setTool = useEditor((s) => s.setRetouchTool);
  const setBrush = useEditor((s) => s.setRetouchBrush);
  const setOpts = useEditor((s) => s.setRetouchOpts);
  const clear = useEditor((s) => s.clearRetouch);
  const rt = layer.retouch ?? { mode: "blur" as const, intensity: 16, strokes: [], regions: [] };
  const marks = rt.strokes.length + rt.regions.length;
  const maxInt = rt.mode === "blur" ? 40 : rt.mode === "pixelate" ? 40 : 90;

  return (
    <details className="rounded-lg border border-line p-2" open={active}>
      <summary className="cursor-pointer text-xs font-medium text-ink-soft">Blur / pixelate tool {marks > 0 && `· ${marks}`}</summary>
      <div className="mt-3 space-y-3">
        <p className="text-[11px] text-ink-soft">Hide faces, plates or text. Pick an effect, then paint or mark a region on the photo.</p>
        <Btn onClick={() => setActive(!active)} className={`w-full ${active ? "bg-vermilion text-white" : ""}`}>
          {active ? "✓ Done" : marks > 0 ? "Paint more" : "Start painting"}
        </Btn>
        {active && <p className="rounded bg-vermilion/10 px-2 py-1.5 text-[11px] text-ink">Now drag on the photo to {tool === "brush" ? "paint over" : "draw a box over"} what you want to hide.</p>}
        <Field label="Effect">
          <Segmented
            value={rt.mode}
            options={[{ value: "blur", label: "Blur" }, { value: "pixelate", label: "Pixelate" }, { value: "mosaic", label: "Mosaic" }]}
            onChange={(v) => {
              const m = v as "blur" | "pixelate" | "mosaic";
              const cap = m === "blur" ? 40 : m === "pixelate" ? 40 : 90;
              setOpts(layer.id, { mode: m, intensity: Math.min(rt.intensity, cap) });
            }}
          />
        </Field>
        <Field label="Tool">
          <Segmented value={tool} options={[{ value: "brush", label: "Brush" }, { value: "rect", label: "▭ Box" }, { value: "circle", label: "◯ Oval" }]} onChange={(v) => { setTool(v as "brush" | "rect" | "circle"); setActive(true); }} />
        </Field>
        {tool === "brush" && (
          <Field label={`Brush size · ${Math.round(brush)}`}>
            <Slider value={brush} min={10} max={240} onChange={setBrush} />
          </Field>
        )}
        <Field label={`Strength · ${Math.round(rt.intensity)}`}>
          <Slider value={Math.min(rt.intensity, maxInt)} min={2} max={maxInt} onChange={(v) => setOpts(layer.id, { intensity: v })} />
        </Field>
        {marks > 0 && <Btn onClick={() => clear(layer.id)} className="w-full text-vermilion">Clear all marks</Btn>}
      </div>
    </details>
  );
}

// ---- Shape / decoration ----------------------------------------------------
function ShapeInspector({ layer }: { layer: import("../../types").ShapeLayer }) {
  const update = useEditor((s) => s.updateLayer);
  const set = (patch: Partial<import("../../types").ShapeLayer>) => update(layer.id, patch);
  if (layer.texture) return <TextureInspector layer={layer} />;
  return (
    <PanelWrap title="Shape">
      <Field label="Fill">
        {layer.fill.kind === "solid" ? (
          <ColorInput value={layer.fill.color} onChange={(v) => set({ fill: { kind: "solid", color: v } })} />
        ) : (
          <GradientEditor fill={layer.fill} onChange={(f) => set({ fill: f })} />
        )}
      </Field>
      <Segmented
        value={layer.fill.kind === "gradient" ? "gradient" : "solid"}
        options={[
          { value: "solid", label: "Solid" },
          { value: "gradient", label: "Gradient" },
        ]}
        onChange={(v) => set({ fill: v === "solid" ? asSolidFrom(layer.fill) : asGradientFrom(layer.fill) })}
      />
      {layer.shape === "rounded" && (
        <Field label="Corner"><Slider value={layer.cornerRadius} min={0} max={300} onChange={(v) => set({ cornerRadius: v })} /></Field>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Opacity"><Slider value={layer.opacity} min={0} max={1} step={0.02} onChange={(v) => set({ opacity: v })} /></Field>
        <Field label="Blend">
          <select value={layer.blend} onChange={(e) => set({ blend: e.target.value as import("../../types").BlendMode })} className="w-full rounded-lg border border-line bg-transparent px-2 py-1.5 text-xs">
            {BLEND_MODES.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </Field>
      </div>
      <label className="flex items-center gap-2 text-xs">
        <input type="checkbox" checked={layer.stroke.enabled} onChange={(e) => set({ stroke: { ...layer.stroke, enabled: e.target.checked } })} /> Border
      </label>
      {layer.stroke.enabled && (
        <>
          <Slider value={layer.stroke.width} min={1} max={30} onChange={(v) => set({ stroke: { ...layer.stroke, width: v } })} />
          <ColorInput value={layer.stroke.color} onChange={(v) => set({ stroke: { ...layer.stroke, color: v } })} />
        </>
      )}
      <LayerActions id={layer.id} />
    </PanelWrap>
  );
}

// ---- Texture ---------------------------------------------------------------
function TextureInspector({ layer }: { layer: ShapeLayer }) {
  const update = useEditor((s) => s.updateLayer);
  const tex = layer.texture as TextureSpec;
  const setTex = (patch: Partial<TextureSpec>) => update(layer.id, { texture: { ...tex, ...patch } });
  const hasBg = tex.background !== "transparent";
  return (
    <PanelWrap title="Texture">
      <Field label="Pattern">
        <div className="grid grid-cols-4 gap-1.5">
          {TEXTURES.map((t) => {
            const isCover = textureIsCover(t.id);
            const url = isCover ? textureFullDataUrl({ ...tex, kind: t.id }, 96, 96) : textureDataUrl({ ...tex, kind: t.id });
            const active = tex.kind === t.id;
            return (
              <button
                key={t.id}
                title={t.label}
                onClick={() => setTex({ kind: t.id })}
                className={`aspect-square rounded-md border bg-white transition ${active ? "border-brand ring-1 ring-brand" : "border-line hover:border-brand"}`}
                style={{ backgroundImage: `url("${url}")`, backgroundRepeat: isCover ? "no-repeat" : "repeat", backgroundSize: isCover ? "cover" : `${tex.scale * 0.7}px` }}
              />
            );
          })}
        </div>
      </Field>
      <Field label="Color">
        <ColorInput value={tex.color} onChange={(v) => setTex({ color: v })} />
      </Field>
      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={hasBg}
          onChange={(e) => setTex({ background: e.target.checked ? "#ffffff" : "transparent" })}
        />
        Background fill
      </label>
      {hasBg && <ColorInput value={tex.background} onChange={(v) => setTex({ background: v })} />}
      <Field label={`Tile size · ${Math.round(tex.scale)}px`}>
        <Slider value={tex.scale} min={6} max={120} onChange={(v) => setTex({ scale: v })} />
      </Field>
      <Field label={`Weight · ${tex.strokeWidth.toFixed(1)}`}>
        <Slider value={tex.strokeWidth} min={0.3} max={10} step={0.1} onChange={(v) => setTex({ strokeWidth: v })} />
      </Field>
      <Field label="Opacity">
        <Slider value={tex.opacity} min={0} max={1} step={0.02} onChange={(v) => setTex({ opacity: v })} />
      </Field>
      <Field label="Blend">
        <select value={layer.blend} onChange={(e) => update(layer.id, { blend: e.target.value as ShapeLayer["blend"] })} className="w-full rounded-lg border border-line bg-transparent px-2 py-1.5 text-xs">
          {BLEND_MODES.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </Field>
      <LayerActions id={layer.id} />
    </PanelWrap>
  );
}

// ---- Background ------------------------------------------------------------
function BackgroundInspector() {
  const bg = useEditor((s) => s.doc.background);
  const setBackground = useEditor((s) => s.setBackground);
  const kind = bg.kind;
  return (
    <PanelWrap title="Background">
      <Field label="Type">
        <Segmented
          value={kind === "gradient" ? "gradient" : "solid"}
          options={[
            { value: "solid", label: "Solid" },
            { value: "gradient", label: "Gradient" },
          ]}
          onChange={(v) => setBackground(v === "solid" ? asSolidFrom(bg) : asGradientFrom(bg))}
        />
      </Field>
      {bg.kind === "solid" && (
        <Field label="Color">
          <ColorInput value={bg.color} onChange={(v) => setBackground({ kind: "solid", color: v })} />
        </Field>
      )}
      {bg.kind === "gradient" && <GradientEditor fill={bg} onChange={(f) => setBackground(f)} />}
      <p className="flex items-center gap-1.5 text-[11px] text-ink-soft">
        <Palette size={12} /> Select something on the canvas to edit it here.
      </p>
    </PanelWrap>
  );
}

export type { Fill };
