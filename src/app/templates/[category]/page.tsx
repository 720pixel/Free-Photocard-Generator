import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/marketing/Header";
import Footer from "@/components/marketing/Footer";
import TemplateCard from "@/components/marketing/TemplateCard";
import { T } from "@/components/marketing/T";
import { CATEGORIES, templatesByCategory, toMeta } from "@/editor/templates";
import { categoryBySlug, categoryMeta, slugifyCategory } from "@/components/marketing/categories";

export function generateStaticParams() {
  return CATEGORIES.filter((c) => templatesByCategory(c).length > 0).map((c) => ({ category: slugifyCategory(c) }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = categoryBySlug(category, CATEGORIES);
  if (!cat) return { title: "টেমপ্লেট পাওয়া যায়নি" };
  const m = categoryMeta(cat);
  const title = `${m.h1Bn} | ${cat} Photocard Templates`;
  const description = `${m.blurbBn} ${m.blurbEn} Free, no watermark.`;
  return {
    title,
    description,
    alternates: { canonical: `/templates/${m.slug}` },
    openGraph: { title, description, url: `/templates/${m.slug}` },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = categoryBySlug(category, CATEGORIES);
  if (!cat) notFound();
  const m = categoryMeta(cat);
  const items = templatesByCategory(cat);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <Link
          href="/templates"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft transition hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          <T bn="সব টেমপ্লেট" en="All templates" />
        </Link>

        <header className="mt-5 max-w-3xl">
          <h1 className="text-3xl font-black tracking-tight text-ink sm:text-5xl">
            <T bn={m.h1Bn} en={m.h1En} />
          </h1>
          <p className="mt-4 text-lg text-ink-soft">
            <T bn={m.blurbBn} en={m.blurbEn} />
          </p>
        </header>

        {items.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((t) => (
              <TemplateCard key={t.id} def={toMeta(t)} />
            ))}
          </div>
        ) : (
          <p className="mt-10 rounded-2xl border border-panel-border bg-panel p-8 text-center text-ink-soft">
            <T bn="এই ক্যাটাগরিতে শীঘ্রই নতুন টেমপ্লেট যোগ হবে।" en="New templates for this category are coming soon." />
          </p>
        )}
      </main>
      <Footer />
    </>
  );
}
