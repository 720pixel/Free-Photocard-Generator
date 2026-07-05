import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

// Shared shell for the About / Terms and custom content pages. Pass either a
// `html` string (admin-authored, from the database) or `children` (static JSX).
export default function LegalPage({
  title,
  updated,
  html,
  children,
}: {
  title: string;
  updated?: string;
  html?: string;
  children?: ReactNode;
}) {
  const proseClass =
    "prose-legal mt-8 space-y-5 text-[15px] leading-relaxed text-ink-soft [&_a]:text-brand [&_a]:underline [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-ink [&_strong]:text-ink [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5";
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-14">
        <h1 className="font-display text-3xl font-black tracking-tight text-ink sm:text-5xl">{title}</h1>
        {updated && <p className="font-mono mt-3 text-xs uppercase tracking-wide text-ink-soft">Last updated: {updated}</p>}
        {html != null ? (
          <div className={proseClass} dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <div className={proseClass}>{children}</div>
        )}
      </main>
      <Footer />
    </>
  );
}
