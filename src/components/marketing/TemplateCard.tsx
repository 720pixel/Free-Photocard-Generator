import Link from "next/link";
import type { TemplateMeta } from "@/editor/templates";
import { categoryMeta } from "./categories";
import { T } from "./T";
import TemplatePreview from "./TemplatePreview";

export default function TemplateCard({ def }: { def: TemplateMeta }) {
  const cat = categoryMeta(def.category);
  return (
    <Link
      href={`/editor?template=${def.id}`}
      className="group block overflow-hidden rounded-lg border border-line bg-panel transition duration-200 hover:-translate-y-1 hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <div className="relative aspect-[4/5] w-full border-b border-line">
        <TemplatePreview def={def} />
        <span className="font-mono absolute right-2 top-2 rounded-sm bg-ink px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-paper">
          <T bn={cat.nameBn} en={cat.nameEn} />
        </span>
      </div>
      <div className="p-3">
        <p className="font-display truncate text-sm font-bold text-ink">
          <T bn={def.nameBn} en={def.name} />
        </p>
        <p className="font-mono truncate text-[11px] text-ink-soft">
          <T bn={def.name} en={def.nameBn} />
        </p>
      </div>
    </Link>
  );
}
