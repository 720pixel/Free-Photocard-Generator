"use client";
import { useMemo, useState } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { useEditor } from "../../store";
import { CATEGORIES, TEMPLATES, instantiate, type TemplateCategory, type TemplateDef } from "../../templates";
import { docDimensions } from "../../types";
import { presetByKey } from "@/lib/presets";
import { renderTemplateSvg } from "../../render/svgPreview";

export function TemplatesPanel() {
  const doc = useEditor((s) => s.doc);
  const loadTemplate = useEditor((s) => s.loadTemplate);
  const [cat, setCat] = useState<TemplateCategory | "All">("All");
  const [q, setQ] = useState("");
  const [catsOpen, setCatsOpen] = useState(false);

  const query = q.trim().toLowerCase();
  const list = useMemo(() => {
    let out = cat === "All" ? TEMPLATES : TEMPLATES.filter((t) => t.category === cat);
    if (query) {
      out = out.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.nameBn.includes(query) ||
          t.category.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }
    return out;
  }, [cat, query]);

  const { w, h } = docDimensions(doc, presetByKey);

  const apply = (def: TemplateDef) => {
    const editorDoc = instantiate(def, doc.size === "custom" ? "1080x1350" : doc.size, w, h);
    editorDoc.size = doc.size;
    editorDoc.customW = doc.customW;
    editorDoc.customH = doc.customH;
    loadTemplate(editorDoc);
  };

  const cats: (TemplateCategory | "All")[] = ["All", ...CATEGORIES.filter((c) => TEMPLATES.some((t) => t.category === c))];

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Search (fixed header) */}
      <div className="shrink-0 border-b border-line p-2">
        <div className="flex items-center gap-1.5 rounded-lg border border-line px-2">
          <Search size={14} className="text-ink-soft" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search templates"
            className="w-full bg-transparent py-1.5 text-xs outline-none"
          />
          {q && (
            <button onClick={() => setQ("")} className="text-ink-soft hover:text-ink">
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Category chips: collapsed = scroll row, expanded = wrapped grid (all shown) */}
      <div className="shrink-0 border-b border-line p-2">
        <div className="flex items-start gap-1.5">
          <div className={catsOpen ? "flex flex-1 flex-wrap gap-1.5" : "no-scrollbar flex flex-1 gap-1.5 overflow-x-auto"}>
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs transition ${cat === c ? "bg-brand text-white" : "border border-line text-ink-soft hover:border-brand"}`}
              >
                {c}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCatsOpen((v) => !v)}
            title={catsOpen ? "Collapse" : "Show all categories"}
            aria-label={catsOpen ? "Collapse categories" : "Show all categories"}
            className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line text-ink-soft transition hover:border-brand hover:text-brand"
          >
            <ChevronDown size={14} className={`transition ${catsOpen ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Grid (scrolls independently) */}
      <div className="min-h-0 flex-1 overflow-y-auto p-2.5">
        {list.length === 0 ? (
          <p className="p-6 text-center text-xs text-ink-soft">No templates match “{q}”.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {list.map((def) => (
              <button key={def.id} onClick={() => apply(def)} className="group text-left" title={def.name}>
                <TemplateThumb def={def} />
                <div className="mt-1 truncate text-[11px] text-ink-soft">{def.name}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Real SVG preview using the same layer data the editor renders, so the
// thumbnail always matches the actual design.
function TemplateThumb({ def }: { def: TemplateDef }) {
  const svg = useMemo(() => {
    const W = 432;
    const H = 540;
    const built = def.build(W, H);
    return renderTemplateSvg({ schemaVersion: 1, templateId: def.id, size: "1080x1350", customW: W, customH: H, ...built }, W, H);
  }, [def]);
  return (
    <div
      className="relative aspect-[4/5] overflow-hidden rounded-lg border border-line bg-white transition group-hover:border-brand"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
