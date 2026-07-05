import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { CATEGORIES, TEMPLATES, templatesByCategory, toMeta } from "@/editor/templates";
import { SIZE_PRESETS } from "@/lib/presets";
import Header from "@/components/marketing/Header";
import Footer from "@/components/marketing/Footer";
import Reveal from "@/components/marketing/Reveal";
import RegisterSW from "@/components/marketing/RegisterSW";
import TemplateCard from "@/components/marketing/TemplateCard";
import TemplatePreview from "@/components/marketing/TemplatePreview";
import { categoryMeta } from "@/components/marketing/categories";
import { T } from "@/components/marketing/T";
import { getPublishedFaq, type FaqEntry } from "@/lib/content";

const TEMPLATE_COUNT = TEMPLATES.length;

const VALUES = [
  {
    tag: "COST",
    titleBn: "সম্পূর্ণ ফ্রি",
    titleEn: "Free forever",
    bodyBn: "কোনো খরচ নেই, কোনো সাবস্ক্রিপশন নেই। যত খুশি বানান।",
    bodyEn: "No cost, no subscription. Make as many as you want.",
  },
  {
    tag: "EXPORT",
    titleBn: "ওয়াটারমার্ক নেই",
    titleEn: "No watermark",
    bodyBn: "পরিষ্কার এক্সপোর্ট, কোনো জোরপূর্বক ব্র্যান্ডিং ছাড়াই।",
    bodyEn: "Clean exports with no forced branding on your card.",
  },
  {
    tag: "OFFLINE",
    titleBn: "অফলাইনেও চলে",
    titleEn: "Works offline",
    bodyBn: "প্রথমবার লোড হওয়ার পর ইন্টারনেট ছাড়াই এডিটর চলে।",
    bodyEn: "After the first load the editor runs with no connection.",
  },
  {
    tag: "TYPE",
    titleBn: "বাংলা ফন্ট প্রথমে",
    titleEn: "Bengali first",
    bodyBn: "সঠিক যুক্তাক্ষর ও বাংলা সংখ্যা সহ পূর্ণ বাংলা সমর্থন।",
    bodyEn: "Full Bengali support with correct conjuncts and digits.",
  },
  {
    tag: "SIZES",
    titleBn: "সব সাইজ প্রিসেট",
    titleEn: "Every preset",
    bodyBn: "ফেসবুক, ইনস্টাগ্রাম, স্টোরি, থাম্বনেইল, এক ক্লিকে।",
    bodyEn: "Facebook, Instagram, story, thumbnail, in one click.",
  },
];

function buildJsonLd(faq: FaqEntry[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Free Photocard Generator",
        url: "https://photocard.720p.red",
        applicationCategory: "DesignApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description: `Free online photocard generator and editor with ${TEMPLATE_COUNT} templates. Design and publish news and social media photocards, no watermark, everything renders in your browser.`,
        inLanguage: ["bn", "en"],
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({
          "@type": "Question",
          name: f.questionEn,
          acceptedAnswer: { "@type": "Answer", text: f.answerEn },
        })),
      },
    ],
  };
}

// Small L-shaped registration crop marks, the print-shop signature.
function CropMark({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const base = "pointer-events-none absolute h-3 w-3 border-brand";
  const map: Record<typeof pos, string> = {
    tl: "left-0 top-0 border-l-2 border-t-2",
    tr: "right-0 top-0 border-r-2 border-t-2",
    bl: "bottom-0 left-0 border-b-2 border-l-2",
    br: "bottom-0 right-0 border-b-2 border-r-2",
  };
  return <span aria-hidden="true" className={`${base} ${map[pos]}`} />;
}

export default async function HomePage() {
  const sheet = TEMPLATES.slice(0, 4).map(toMeta);
  const showcase = TEMPLATES.slice(0, 8).map(toMeta);
  const abstractShowcase = templatesByCategory("Abstract").slice(0, 8).map(toMeta);
  const usedCategories = CATEGORIES.filter((c) => templatesByCategory(c).length > 0);
  const faq = await getPublishedFaq();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(faq)) }} />
      <RegisterSW />
      <Header />

      <main className="mx-auto max-w-6xl px-4">
        {/* ── Hero: the press sheet ─────────────────────────────── */}
        <section className="pt-10 sm:pt-16">
          {/* Masthead nameplate */}
          <div className="flex items-center justify-between gap-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink-soft sm:text-xs">
            <span>Free Photocard Generator</span>
            <span className="text-right">
              No.{TEMPLATE_COUNT} Templates &middot; Est. 2026
            </span>
          </div>
          <div className="press-rule mt-3" />

          <div className="grid gap-8 pt-8 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-10">
            {/* Left: headline block */}
            <div>
              <span className="font-mono inline-flex items-center gap-2 rounded-full border border-ink px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-ink">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                <T bn="ফ্রি · ওয়াটারমার্ক নেই · ব্রাউজারেই" en="Free · No watermark · In browser" />
              </span>

              <h1 className="font-display mt-5 text-[2.6rem] font-bold leading-[0.98] tracking-[-0.03em] text-ink sm:text-6xl lg:text-[4.25rem]">
                <T
                  bn={
                    <>
                      সোশ্যাল ফটোকার্ড,{" "}
                      <span className="text-brand">প্রকাশের জন্য প্রস্তুত।</span>
                    </>
                  }
                  en={
                    <>
                      Social photocards,{" "}
                      <span className="text-brand">ready to publish.</span>
                    </>
                  }
                />
              </h1>

              <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-soft">
                <T
                  bn={`${TEMPLATE_COUNT}টি ফ্রি টেমপ্লেট। একটি বাছুন, বাংলা বা ইংরেজিতে শিরোনাম লিখুন, নিখুঁত মাপে ডাউনলোড করুন। সব কিছু আপনার ব্রাউজারেই।`}
                  en={`${TEMPLATE_COUNT} free templates. Pick one, type your headline in Bengali or English, download at the exact size. Everything runs in your browser.`}
                />
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/editor"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-7 py-4 text-base font-semibold text-paper transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:w-auto"
                >
                  <T bn="এডিটর খুলুন" en="Open the editor" />
                  <ArrowRight className="h-5 w-5" strokeWidth={2} />
                </Link>
                <Link
                  href="/templates"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-ink bg-transparent px-7 py-4 text-base font-semibold text-ink transition hover:bg-ink hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:w-auto"
                >
                  <T bn="টেমপ্লেট দেখুন" en="Browse templates" />
                </Link>
              </div>

              <p className="font-mono mt-5 text-xs uppercase tracking-wide text-ink-soft">
                <T bn="৬০ সেকেন্ডে তৈরি · সাইন আপ ছাড়াই" en="Ready in 60 seconds · No sign up" />
              </p>
            </div>

            {/* Right: live contact sheet of real previews */}
            <Reveal>
              <div className="relative border-2 border-ink bg-panel p-3 sm:p-4">
                <CropMark pos="tl" />
                <CropMark pos="tr" />
                <CropMark pos="bl" />
                <CropMark pos="br" />
                <div className="flex items-center justify-between border-b border-line pb-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-ink-soft">
                  <span>Press Sheet</span>
                  <span className="text-brand">Live Preview</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {sheet.map((t) => (
                    <Link
                      key={t.id}
                      href={`/editor?template=${t.id}`}
                      className="group block border border-line bg-white transition hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      <div className="relative aspect-[4/5] w-full overflow-hidden">
                        <TemplatePreview def={t} />
                      </div>
                      <p className="font-mono truncate border-t border-line px-2 py-1 text-[10px] uppercase tracking-wide text-ink-soft">
                        {t.name}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Value strip: spec sheet ───────────────────────────── */}
        <section className="mt-20 sm:mt-28">
          <div className="grid divide-y divide-line border-y border-ink sm:grid-cols-2 sm:divide-x lg:grid-cols-5 lg:divide-y-0">
            {VALUES.map((v) => (
              <div key={v.tag} className="p-6">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-brand">{v.tag}</p>
                <h3 className="font-display mt-3 text-xl font-bold tracking-tight text-ink">
                  <T bn={v.titleBn} en={v.titleEn} />
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  <T bn={v.bodyBn} en={v.bodyEn} />
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Abstract showcase ─────────────────────────────────── */}
        {abstractShowcase.length > 0 && (
          <section className="mt-20 sm:mt-28">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-ink-soft">
                  <T bn="অ্যাবস্ট্রাক্ট" en="Abstract" />
                </p>
                <h2 className="font-display mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                  <T bn="সৃজনশীল অ্যাবস্ট্রাক্ট ডিজাইন" en="Creative abstract designs" />
                </h2>
              </div>
              <Link
                href="/templates/abstract"
                className="font-mono inline-flex shrink-0 items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink transition hover:text-brand"
              >
                <T bn="সব দেখুন" en="View all" />
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {abstractShowcase.map((t) => (
                <TemplateCard key={t.id} def={t} />
              ))}
            </div>
          </section>
        )}

        {/* ── Template showcase ─────────────────────────────────── */}
        <section className="mt-20 sm:mt-28">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-ink-soft">
                <T bn={`${TEMPLATE_COUNT} টেমপ্লেট`} en={`${TEMPLATE_COUNT} templates`} />
              </p>
              <h2 className="font-display mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                <T bn="প্রেস থেকে সোজা" en="Straight off the press" />
              </h2>
            </div>
            <Link
              href="/templates"
              className="font-mono inline-flex shrink-0 items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink transition hover:text-brand"
            >
              <T bn="সব দেখুন" en="View all" />
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {showcase.map((t) => (
              <TemplateCard key={t.id} def={t} />
            ))}
          </div>
        </section>

        {/* ── Size presets ──────────────────────────────────────── */}
        <section className="mt-20 sm:mt-28">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-ink-soft">
            <T bn="এক্সপোর্ট সাইজ" en="Export sizes" />
          </p>
          <h2 className="font-display mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            <T bn="প্রতিটি সোশ্যাল মাপ" en="Every social size" />
          </h2>
          <p className="mt-3 max-w-2xl text-ink-soft">
            <T
              bn="প্রতিটি প্ল্যাটফর্মের জন্য নিখুঁত পিক্সেল মাপে এক্সপোর্ট করুন, লেআউট নিজে থেকেই মানিয়ে নেয়।"
              en="Export at the exact pixel size for each platform. The layout adapts on its own."
            />
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {SIZE_PRESETS.map((p) => (
              <Link
                key={p.key}
                href={`/editor?size=${p.key}`}
                className="group block border border-line bg-panel p-4 transition hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <p className="font-display text-base font-bold text-ink">
                  <T bn={p.labelBn} en={p.label} />
                </p>
                <p className="font-mono mt-1 text-xs tracking-wide text-ink-soft">
                  {p.w} &times; {p.h}
                </p>
                <p className="font-mono mt-2 text-[10px] font-bold uppercase tracking-wide text-brand opacity-0 transition group-hover:opacity-100">
                  <T bn="খালি এডিটর খুলুন →" en="Open blank editor →" />
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Categories ────────────────────────────────────────── */}
        <section className="mt-20 sm:mt-28">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-ink-soft">
            <T bn="বিভাগ" en="Desks" />
          </p>
          <h2 className="font-display mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            <T bn="ক্যাটাগরি অনুযায়ী টেমপ্লেট" en="Templates by category" />
          </h2>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {usedCategories.map((c) => {
              const m = categoryMeta(c);
              const count = templatesByCategory(c).length;
              return (
                <Link
                  key={m.slug}
                  href={`/templates/${m.slug}`}
                  className="group inline-flex items-center gap-2 rounded-full border border-line bg-panel py-2 pl-4 pr-2.5 text-sm font-semibold text-ink transition hover:border-ink hover:bg-ink hover:text-paper"
                >
                  <T bn={m.nameBn} en={m.nameEn} />
                  <span className="font-mono rounded-full bg-brand/10 px-1.5 py-0.5 text-[11px] font-bold text-brand group-hover:bg-paper/20 group-hover:text-paper">
                    {count}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────── */}
        <section className="mt-20 sm:mt-28">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-ink-soft">
            <T bn="সাহায্য" en="Help desk" />
          </p>
          <h2 className="font-display mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            <T bn="সাধারণ প্রশ্ন" en="Frequently asked questions" />
          </h2>
          <div className="mt-6 border-t border-line">
            {faq.map((f, i) => (
              <details
                key={`${f.questionEn}-${i}`}
                className="group border-b border-line [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="font-display flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-base font-bold text-ink">
                  <span>
                    <T bn={f.questionBn} en={f.questionEn} />
                  </span>
                  <Plus
                    className="h-5 w-5 shrink-0 text-brand transition group-open:rotate-45"
                    strokeWidth={2.25}
                  />
                </summary>
                <p className="pb-4 text-sm leading-relaxed text-ink-soft">
                  <T bn={f.answerBn} en={f.answerEn} />
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* ── Final CTA ─────────────────────────────────────────── */}
        <section className="mt-20 sm:mt-28">
          <div className="relative overflow-hidden border-2 border-ink bg-ink px-6 py-14 text-center sm:px-12 sm:py-20">
            <div className="press-rule absolute inset-x-0 top-0" />
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-marigold">
              <T bn="প্রেস চালু" en="Go to press" />
            </p>
            <h2 className="font-display mx-auto mt-4 max-w-2xl text-3xl font-bold tracking-tight text-paper sm:text-5xl">
              <T bn="এখনই আপনার ফটোকার্ড বানান" en="Make your photocard now" />
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-paper/70">
              <T
                bn="ফ্রি, ওয়াটারমার্ক ছাড়া, সরাসরি আপনার ব্রাউজারে।"
                en="Free, watermark free, right in your browser."
              />
            </p>
            <Link
              href="/editor"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-8 py-4 text-base font-semibold text-paper transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marigold"
            >
              <T bn="এডিটর খুলুন" en="Open the editor" />
              <ArrowRight className="h-5 w-5" strokeWidth={2} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
