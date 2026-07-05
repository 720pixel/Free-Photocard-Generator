import type { TemplateMeta } from "@/editor/templates";
import { templateById } from "@/editor/templates";
import { renderTemplateSvg } from "@/editor/render/svgPreview";

// Real SVG preview built from the same layer data the editor renders, so the
// site thumbnail always matches the actual design. Server-safe (pure string).
export default function TemplatePreview({ def }: { def: TemplateMeta }) {
  const full = templateById(def.id);
  if (!full) {
    return <div className="h-full w-full" style={{ background: def.palette.secondary }} aria-hidden="true" />;
  }
  const W = 480;
  const H = 600;
  const built = full.build(W, H);
  const svg = renderTemplateSvg(
    { schemaVersion: 1, templateId: full.id, size: "1080x1350", customW: W, customH: H, ...built },
    W,
    H,
  );
  return <div className="h-full w-full overflow-hidden bg-white" aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />;
}
