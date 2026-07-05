import { BD_FRAMES } from "./bd-frames";
import { ABSTRACT_TEMPLATES } from "./abstract";
import { ABSTRACT_B } from "./abstract-b";
import { ABSTRACT_C } from "./abstract-c";
import { ABSTRACT_D } from "./abstract-d";
import { AMINUL_FRAMES } from "./aminul-frames";
import { THEMED_FRAMES } from "./themed-frames";
import { COLLAGE_TEMPLATES } from "./collage-templates";
import type { TemplateCategory, TemplateDef } from "./types";

export * from "./types";

export const TEMPLATES: TemplateDef[] = [
  ...AMINUL_FRAMES,
  ...BD_FRAMES,
  ...THEMED_FRAMES,
  ...ABSTRACT_TEMPLATES,
  ...ABSTRACT_B,
  ...ABSTRACT_C,
  ...ABSTRACT_D,
  ...COLLAGE_TEMPLATES,
];

export function templateById(id: string): TemplateDef | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export const CATEGORIES: TemplateCategory[] = [
  "Breaking News",
  "TV Channel",
  "Newspaper",
  "Sports",
  "Entertainment",
  "Religious",
  "Tribute",
  "Notice",
  "Quote",
  "Weather",
  "Abstract",
  "Collage",
  "General",
];

export function templatesByCategory(cat: TemplateCategory): TemplateDef[] {
  return TEMPLATES.filter((t) => t.category === cat);
}
