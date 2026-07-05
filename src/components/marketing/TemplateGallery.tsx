"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import type { TemplateCategory, TemplateMeta } from "@/editor/templates";
import { categoryMeta } from "./categories";
import { T } from "./T";
import TemplateCard from "./TemplateCard";

interface Props {
  templates: TemplateMeta[];
  categories: TemplateCategory[];
}

// Client filter over the full, server rendered template list. The full grid is
// present in the DOM for SEO; filtering only hides cards client side.
export default function TemplateGallery({ templates, categories }: Props) {
  const [active, setActive] = useState<TemplateCategory | "all">("all");

  const used = useMemo(
    () => categories.filter((c) => templates.some((t) => t.category === c)),
    [categories, templates],
  );

  const shown = active === "all" ? templates : templates.filter((t) => t.category === active);

  return (
    <div>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
        <Chip label={<T bn="সব" en="All" />} active={active === "all"} onClick={() => setActive("all")} />
        {used.map((c) => {
          const m = categoryMeta(c);
          return (
            <Chip
              key={m.slug}
              label={<T bn={m.nameBn} en={m.nameEn} />}
              active={active === c}
              onClick={() => setActive(c)}
            />
          );
        })}
      </div>

      <p className="font-mono mt-4 text-xs uppercase tracking-wide text-ink-soft">
        {shown.length}{" "}
        <T bn={shown.length === 1 ? "টেমপ্লেট" : "টেমপ্লেট"} en={shown.length === 1 ? "template" : "templates"} />
      </p>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {shown.map((t) => (
          <TemplateCard key={t.id} def={t} />
        ))}
      </div>
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "font-mono shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition " +
        (active
          ? "border-ink bg-ink text-paper"
          : "border-line bg-panel text-ink-soft hover:border-ink hover:text-ink")
      }
    >
      {label}
    </button>
  );
}
