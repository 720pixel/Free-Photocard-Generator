import Link from "next/link";
import { Github } from "lucide-react";
import { CATEGORIES } from "@/editor/templates";
import { categoryMeta } from "./categories";
import LogoMark from "@/components/LogoMark";
import { T } from "./T";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-ink">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <LogoMark size={34} className="rounded-[8px]" />
              <span className="font-display text-sm font-bold text-ink">Free Photocard Generator</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-ink-soft">
              <T
                bn="ফ্রি নিউজ ও সোশ্যাল মিডিয়া ফটোকার্ড জেনারেটর। কোনো ওয়াটারমার্ক নেই, সব কিছু আপনার ব্রাউজারেই।"
                en="Free news and social media photocard generator. No watermark, everything in your browser."
              />
            </p>
            <a
              href="https://github.com/720pixel/Free-Photocard-Generator"
              target="_blank"
              rel="noopener"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft transition hover:border-ink hover:text-ink"
            >
              <Github className="h-4 w-4" strokeWidth={1.75} />
              <T bn="সোর্স কোড" en="Source on GitHub" />
            </a>
          </div>

          <div>
            <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-ink-soft">
              <T bn="দ্রুত লিংক" en="Quick links" />
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/editor" className="text-ink transition hover:text-brand">
                  <T bn="এডিটর" en="Editor" />
                </Link>
              </li>
              <li>
                <Link href="/templates" className="text-ink transition hover:text-brand">
                  <T bn="সব টেমপ্লেট" en="All templates" />
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-ink transition hover:text-brand">
                  <T bn="আমাদের সম্পর্কে" en="About" />
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-ink transition hover:text-brand">
                  <T bn="শর্তাবলী" en="Terms" />
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-ink-soft">
              <T bn="ক্যাটাগরি" en="Categories" />
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2 text-sm">
              {CATEGORIES.map((c) => {
                const m = categoryMeta(c);
                return (
                  <li key={m.slug}>
                    <Link
                      href={`/templates/${m.slug}`}
                      className="inline-block rounded-full border border-line px-3 py-1 text-ink-soft transition hover:border-ink hover:text-ink"
                    >
                      <T bn={m.nameBn} en={m.nameEn} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="press-rule mt-10" />
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">
            &copy; {new Date().getFullYear()} Free Photocard Generator &middot; photocard.720p.red
          </p>
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">
            <T bn="নির্মাতা" en="Built by" />{" "}
            <a href="https://720p.red" target="_blank" rel="noopener me" className="font-bold text-ink transition hover:text-brand">
              720p.red
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
