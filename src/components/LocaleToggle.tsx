"use client";

import { useEffect, useState } from "react";
import { Languages } from "lucide-react";

// Lightweight bn/en switch. Copy across the marketing pages is rendered as
// paired <span class="i18n-bn"> / <span class="i18n-en"> nodes; this toggle
// flips data-lang on <html> and a tiny global style hides the inactive one.
// Default (no attribute) shows Bengali, the primary locale, at SSR time.
export default function LocaleToggle() {
  const [lang, setLang] = useState<"bn" | "en">("en");

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("lang");
    } catch {}
    const initial = saved === "bn" ? "bn" : "en";
    document.documentElement.setAttribute("data-lang", initial);
    setLang(initial);
  }, []);

  function toggle() {
    const next = lang === "bn" ? "en" : "bn";
    document.documentElement.setAttribute("data-lang", next);
    try {
      localStorage.setItem("lang", next);
    } catch {}
    setLang(next);
  }

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html:
            'html[data-lang="bn"] .i18n-en{display:none!important}html:not([data-lang="bn"]) .i18n-bn{display:none!important}',
        }}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label="ভাষা পরিবর্তন করুন"
        title="Switch language"
        className="inline-flex h-10 items-center gap-1.5 rounded-full border border-panel-border bg-panel px-3 text-sm font-semibold text-ink transition hover:border-brand hover:text-brand"
      >
        <Languages className="h-4 w-4" strokeWidth={1.5} />
        {lang === "bn" ? "বাং" : "EN"}
      </button>
    </>
  );
}
