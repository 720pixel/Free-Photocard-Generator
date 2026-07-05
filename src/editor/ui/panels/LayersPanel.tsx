"use client";
import { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Type,
  ImagePlus,
  Square,
  Circle as CircleIcon,
  Triangle,
  Minus,
  Trash2,
} from "lucide-react";
import { useEditor } from "../../store";
import { makeHeading, makeImage, makeLogo, makeShape, makeTexture, solid } from "../../factories";
import { docDimensions, type Layer, type ShapeLayer } from "../../types";
import { presetByKey } from "@/lib/presets";
import { TEXTURES, textureDataUrl, textureFullDataUrl, textureIsCover, DEFAULT_TEXTURE } from "../../textures";
import { ELEMENTS, signatureElements, type ElementDef } from "../../elements";
import { COLLAGES, buildCollage } from "../../collage";
import { BACKGROUNDS, makeBackgroundLayer } from "../../backgrounds";
import { FRAME_SHAPES } from "../../frameShapes";
import { templateById } from "../../templates";
import { renderTemplateSvg } from "../../render/svgPreview";

const ICON: Record<Layer["type"], React.ReactNode> = {
  text: <Type size={13} />,
  image: <ImagePlus size={13} />,
  logo: <ImagePlus size={13} />,
  shape: <Square size={13} />,
  decoration: <Square size={13} />,
};

const SHAPES: { id: ShapeLayer["shape"]; label: string; icon: React.ReactNode; extra?: Partial<ShapeLayer> }[] = [
  { id: "rect", label: "Rect", icon: <Square size={14} /> },
  { id: "rounded", label: "Round", icon: <Square size={14} className="rounded" />, extra: { cornerRadius: 32 } },
  { id: "circle", label: "Circle", icon: <CircleIcon size={14} /> },
  { id: "ellipse", label: "Ellipse", icon: <CircleIcon size={14} className="scale-x-125" /> },
  { id: "triangle", label: "Triangle", icon: <Triangle size={14} /> },
  { id: "rect", label: "Line", icon: <Minus size={14} />, extra: { height: 12, width: 400 } },
];

export function LayersPanel() {
  const layers = useEditor((s) => s.doc.layers);
  const doc = useEditor((s) => s.doc);
  const selectedId = useEditor((s) => s.selectedId);
  const select = useEditor((s) => s.select);
  const update = useEditor((s) => s.updateLayer);
  const move = useEditor((s) => s.moveLayer);
  const remove = useEditor((s) => s.removeLayer);
  const add = useEditor((s) => s.addLayer);
  const addLayers = useEditor((s) => s.addLayers);
  const [showElements, setShowElements] = useState(false);

  const { w, h } = docDimensions(doc, presetByKey);

  // Signature add-ons for the loaded template (or its category default).
  const tpl = doc.templateId ? templateById(doc.templateId) : undefined;
  const tplElements = signatureElements(tpl?.category ?? "General", tpl?.elements);

  // top of stack renders last (front); show reversed so front is on top of the list
  const ordered = [...layers].reverse();

  return (
    <div className="flex h-full flex-col">
      <div className="grid grid-cols-4 gap-1.5 border-b border-line p-2">
        <AddBtn label="Text" onClick={() => add(makeHeading("Your headline", { x: 80, y: 120, width: 500, height: 160 }))}><Type size={14} /></AddBtn>
        <AddBtn label="Photo" onClick={() => add(makeImage({ x: 100, y: 300 }))}><ImagePlus size={14} /></AddBtn>
        <AddBtn label="Logo" onClick={() => add(makeLogo({ x: 40, y: 40 }))}><ImagePlus size={14} /></AddBtn>
        <AddBtn label="Elements" onClick={() => setShowElements((v) => !v)}><Square size={14} /></AddBtn>
      </div>

      {showElements && (
        <div className="max-h-[62%] space-y-3 overflow-y-auto border-b border-line p-2.5">
          <Section title="Shapes">
            <div className="grid grid-cols-6 gap-1.5">
              {SHAPES.map((s, i) => (
                <button
                  key={s.label + i}
                  title={s.label}
                  onClick={() =>
                    add(
                      makeShape({
                        shape: s.id,
                        x: w * 0.3,
                        y: h * 0.35,
                        width: 240,
                        height: 240,
                        fill: solid("#e8462b"),
                        ...s.extra,
                      }),
                    )
                  }
                  className="grid aspect-square place-items-center rounded-md border border-line text-ink-soft transition hover:border-brand hover:text-brand"
                >
                  {s.icon}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Textures">
            <div className="grid grid-cols-4 gap-1.5">
              {TEXTURES.map((t) => {
                const spec = { ...DEFAULT_TEXTURE, kind: t.id, ...t.defaults, color: "#111111", opacity: 0.7 };
                const isCover = textureIsCover(t.id);
                const url = isCover ? textureFullDataUrl(spec, 96, 96) : textureDataUrl(spec);
                return (
                  <button
                    key={t.id}
                    title={t.label}
                    onClick={() => add(makeTexture(t.id, { x: 0, y: 0, width: w, height: h }))}
                    className="aspect-square rounded-md border border-line bg-white transition hover:border-brand"
                    style={{ backgroundImage: `url("${url}")`, backgroundRepeat: isCover ? "no-repeat" : "repeat", backgroundSize: isCover ? "cover" : `${(t.defaults?.scale ?? 28) * 0.7}px` }}
                  />
                );
              })}
            </div>
            <p className="mt-1.5 text-[10px] text-ink-soft">Textures overlay the whole canvas. Select one to change color, size and opacity.</p>
          </Section>

          <Section title="Backgrounds">
            <div className="grid grid-cols-4 gap-1.5">
              {BACKGROUNDS.map((b) => (
                <button
                  key={b.id}
                  title={b.label}
                  onClick={() => add(makeBackgroundLayer(b, w, h), false)}
                  className="aspect-square rounded-md border border-line bg-white bg-cover bg-center transition hover:border-brand"
                  style={{ backgroundImage: `url("${b.src}")` }}
                />
              ))}
            </div>
            <p className="mt-1.5 text-[10px] text-ink-soft">Added behind your design. Select it to move, resize, recolor or change opacity and blend.</p>
          </Section>

          {tplElements.length > 0 && (
            <Section title="For this template">
              <div className="grid grid-cols-3 gap-1.5">
                {tplElements.map((el) => (
                  <ElementButton key={"sig-" + el.id} el={el} onAdd={() => addLayers(el.build(w, h))} highlight />
                ))}
              </div>
            </Section>
          )}

          <Section title="All elements">
            <div className="grid grid-cols-3 gap-1.5">
              {ELEMENTS.map((el) => (
                <ElementButton key={el.id} el={el} onAdd={() => addLayers(el.build(w, h))} />
              ))}
            </div>
          </Section>

          <Section title="Frames">
            <div className="grid grid-cols-4 gap-1.5">
              {FRAME_SHAPES.map((fr) => {
                const PW = 120;
                const PH = 120;
                const slot = makeImage({ x: PW * 0.1, y: PH * 0.1, width: PW * 0.8, height: PH * 0.8, mask: fr.id as ReturnType<typeof makeImage>["mask"], cornerRadius: fr.id === "rounded" ? 20 : 0 });
                const svg = renderTemplateSvg({ schemaVersion: 1, templateId: null, size: "1080x1080", customW: PW, customH: PH, background: solid("#f4f1ea"), layers: [slot] }, PW, PH);
                return (
                  <button
                    key={fr.id}
                    title={fr.label}
                    onClick={() => {
                      const u = Math.min(w, h) * 0.42;
                      add(makeImage({ x: w * 0.5 - u / 2, y: h * 0.4 - u / 2, width: u, height: u, mask: fr.id as ReturnType<typeof makeImage>["mask"], cornerRadius: fr.id === "rounded" ? 48 : 0, placeholderLabel: "ছবি" }));
                    }}
                    className="aspect-square overflow-hidden rounded-md border border-line bg-white transition hover:border-brand"
                    dangerouslySetInnerHTML={{ __html: svg }}
                  />
                );
              })}
            </div>
            <p className="mt-1.5 text-[10px] text-ink-soft">Drop or drag a photo onto a frame to fill it.</p>
          </Section>

          <Section title="Collage">
            <div className="grid grid-cols-4 gap-1.5">
              {COLLAGES.map((cg) => {
                const PW = 120;
                const PH = 150;
                const svg = renderTemplateSvg({ schemaVersion: 1, templateId: null, size: "1080x1350", customW: PW, customH: PH, background: solid("#e7e2d8"), layers: buildCollage(cg, PW, PH) }, PW, PH);
                return (
                  <button
                    key={cg.id}
                    title={cg.label}
                    onClick={() => addLayers(buildCollage(cg, w, h))}
                    className="overflow-hidden rounded-md border border-line bg-white transition hover:border-brand"
                  >
                    <div className="aspect-[4/5]" dangerouslySetInnerHTML={{ __html: svg }} />
                  </button>
                );
              })}
            </div>
          </Section>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-1.5">
        {ordered.length === 0 && <p className="p-4 text-center text-xs text-ink-soft">No layers yet. Add one above or pick a template.</p>}
        {ordered.map((l) => (
          <div
            key={l.id}
            onClick={() => select(l.id)}
            className={`mb-1 flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs transition ${
              selectedId === l.id ? "border-brand bg-brand/10" : "border-transparent hover:bg-line/40"
            }`}
          >
            <span className="text-ink-soft">{ICON[l.type]}</span>
            <span className="flex-1 truncate">{l.type === "text" ? (l as { text: string }).text || l.name : l.name}</span>
            <button onClick={(e) => { e.stopPropagation(); update(l.id, { visible: !l.visible }); }} className="text-ink-soft hover:text-ink">
              {l.visible ? <Eye size={13} /> : <EyeOff size={13} />}
            </button>
            <button onClick={(e) => { e.stopPropagation(); update(l.id, { locked: !l.locked }); }} className="text-ink-soft hover:text-ink">
              {l.locked ? <Lock size={13} /> : <Unlock size={13} />}
            </button>
            <button onClick={(e) => { e.stopPropagation(); move(l.id, "up"); }} className="text-ink-soft hover:text-ink"><ChevronUp size={13} /></button>
            <button onClick={(e) => { e.stopPropagation(); move(l.id, "down"); }} className="text-ink-soft hover:text-ink"><ChevronDown size={13} /></button>
            <button onClick={(e) => { e.stopPropagation(); remove(l.id); }} className="text-ink-soft hover:text-rose-500"><Trash2 size={13} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ElementButton({ el, onAdd, highlight }: { el: ElementDef; onAdd: () => void; highlight?: boolean }) {
  const PW = 120;
  const PH = 150;
  const svg = renderTemplateSvg(
    { schemaVersion: 1, templateId: null, size: "1080x1350", customW: PW, customH: PH, background: solid("#f4f1ea"), layers: el.build(PW, PH) },
    PW,
    PH,
  );
  return (
    <button
      title={el.label}
      onClick={onAdd}
      className={`overflow-hidden rounded-md border bg-white transition hover:border-brand ${highlight ? "border-brand/50" : "border-line"}`}
    >
      <div className="aspect-[4/5]" dangerouslySetInnerHTML={{ __html: svg }} />
      <div className="truncate px-1 py-0.5 text-[9px] text-ink-soft">{el.label}</div>
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-ink-soft">{title}</h4>
      {children}
    </div>
  );
}

function AddBtn({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-0.5 rounded-lg border border-line py-2 text-[10px] text-ink-soft transition hover:border-brand hover:text-brand">
      {children}
      {label}
    </button>
  );
}
