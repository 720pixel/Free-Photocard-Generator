"use client";

import { useState } from "react";
import Link from "next/link";
import { LogIn, Menu, UserPlus, Wand2, X } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import LocaleToggle from "@/components/LocaleToggle";
import LogoMark from "@/components/LogoMark";
import { T } from "./T";

// Open-source build ships the editor only; account and generator nav are gated.
const isPublic = process.env.NEXT_PUBLIC_EDITION === "public";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink bg-[var(--paper)]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Free Photocard Generator">
          <LogoMark size={38} className="rounded-[9px]" />
          <span className="hidden leading-none sm:block">
            <span className="font-display block text-sm font-bold tracking-tight text-ink">
              Free Photocard
            </span>
            <span className="font-mono block text-[10px] uppercase tracking-[0.18em] text-ink-soft">
              Generator
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-2 md:flex">
          {!isPublic && (
            <Link
              href="/generate"
              className="font-mono inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold uppercase tracking-wide text-ink-soft transition hover:text-brand"
            >
              <Wand2 className="h-3.5 w-3.5" strokeWidth={2} />
              <T bn="জেনারেট" en="Generate" />
            </Link>
          )}
          <Link
            href="/templates"
            className="font-mono rounded-full px-3 py-2 text-xs font-bold uppercase tracking-wide text-ink-soft transition hover:text-brand"
          >
            <T bn="টেমপ্লেট" en="Templates" />
          </Link>
          <LocaleToggle />
          <ThemeToggle />
          {!isPublic && (
            <>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-panel px-3 py-2 text-sm font-semibold text-ink transition hover:border-ink"
              >
                <LogIn className="h-4 w-4" strokeWidth={1.75} />
                <T bn="লগইন" en="Login" />
              </Link>
              <Link
                href="/apply"
                className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3.5 py-2 text-sm font-semibold text-paper transition hover:opacity-90"
              >
                <UserPlus className="h-4 w-4" strokeWidth={1.75} />
                <T bn="আবেদন" en="Apply" />
              </Link>
            </>
          )}
        </nav>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <LocaleToggle />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="grid h-10 w-10 place-items-center rounded-full border border-line bg-panel text-ink transition hover:border-ink"
          >
            {open ? <X className="h-5 w-5" strokeWidth={1.75} /> : <Menu className="h-5 w-5" strokeWidth={1.75} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-line bg-[var(--paper)] md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {!isPublic && (
              <Link
                href="/generate"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-3 text-base font-semibold text-paper"
              >
                <Wand2 className="h-5 w-5" strokeWidth={1.75} />
                <T bn="অটো জেনারেট" en="Auto generate" />
              </Link>
            )}
            <Link
              href="/editor"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-3 text-base font-semibold text-paper"
            >
              <Wand2 className="h-5 w-5" strokeWidth={1.75} />
              <T bn="এডিটর খুলুন" en="Open the editor" />
            </Link>
            <Link
              href="/templates"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-line px-4 py-3 text-base font-semibold text-ink"
            >
              <T bn="টেমপ্লেট দেখুন" en="Browse templates" />
            </Link>
            {!isPublic && (
            <div className="mt-1 grid grid-cols-2 gap-1">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-line px-4 py-3 text-sm font-semibold text-ink"
              >
                <LogIn className="h-4 w-4" strokeWidth={1.75} />
                <T bn="লগইন" en="Login" />
              </Link>
              <Link
                href="/apply"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-ink px-4 py-3 text-sm font-semibold text-ink"
              >
                <UserPlus className="h-4 w-4" strokeWidth={1.75} />
                <T bn="আবেদন" en="Apply" />
              </Link>
            </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
