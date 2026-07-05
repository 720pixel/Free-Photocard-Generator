// PUBLIC edition content layer: static only. The open-source build has no
// database, so pages render the bundled default copy. Same API surface as the
// full build, minus anything server-side.
import { DEFAULT_FAQ, DEFAULT_PAGE_BY_SLUG } from "@/content/defaults";

export type PageContent = {
  slug: string;
  title: string;
  body: string;
  updatedLabel: string | null;
};

export type FaqEntry = {
  questionBn: string;
  questionEn: string;
  answerBn: string;
  answerEn: string;
};

export async function getPageContent(slug: string): Promise<PageContent | null> {
  const d = DEFAULT_PAGE_BY_SLUG[slug];
  if (!d) return null;
  return { slug: d.slug, title: d.title, body: d.body, updatedLabel: d.updatedLabel ?? null };
}

export async function getPublishedFaq(): Promise<FaqEntry[]> {
  return DEFAULT_FAQ;
}
