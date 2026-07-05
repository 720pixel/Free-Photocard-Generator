import type { Metadata } from "next";
import Header from "@/components/marketing/Header";
import Footer from "@/components/marketing/Footer";
import TemplateGallery from "@/components/marketing/TemplateGallery";
import { T } from "@/components/marketing/T";
import { CATEGORIES, TEMPLATES, toMeta } from "@/editor/templates";

export const metadata: Metadata = {
  title: "সব ফটোকার্ড টেমপ্লেট | Free News Photocard Templates",
  description:
    "৫০+ ফ্রি বাংলা নিউজ ও সোশ্যাল মিডিয়া ফটোকার্ড টেমপ্লেট। Browse all free photocard templates, no watermark, edit in your browser.",
  alternates: { canonical: "/templates" },
  openGraph: {
    title: "সব ফটোকার্ড টেমপ্লেট | Free News Photocard Templates",
    description: "৫০+ ফ্রি বাংলা নিউজ ফটোকার্ড টেমপ্লেট। No watermark, everything in your browser.",
    url: "/templates",
  },
};

export default function TemplatesPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <header className="max-w-3xl">
          <h1 className="text-3xl font-black tracking-tight text-ink sm:text-5xl">
            <T bn="ফটোকার্ড টেমপ্লেট গ্যালারি" en="Photocard Template Gallery" />
          </h1>
          <p className="mt-4 text-lg text-ink-soft">
            <T
              bn={`${TEMPLATES.length}+ ফ্রি নিউজ ও সোশ্যাল মিডিয়া ফটোকার্ড টেমপ্লেট। ক্যাটাগরি বেছে নিন, একটি টেমপ্লেটে ক্লিক করে সরাসরি এডিটরে খুলুন।`}
              en={`${TEMPLATES.length}+ free news and social media photocard templates. Pick a category and click any template to open it straight in the editor.`}
            />
          </p>
        </header>

        <div className="mt-10">
          <TemplateGallery templates={TEMPLATES.map(toMeta)} categories={CATEGORIES} />
        </div>
      </main>
      <Footer />
    </>
  );
}
