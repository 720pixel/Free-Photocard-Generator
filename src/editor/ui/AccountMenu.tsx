"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogIn, User } from "lucide-react";

type MeUser = { username: string; email: string } | null;

export default function AccountMenu() {
  const [user, setUser] = useState<MeUser | undefined>(undefined);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/unavailable/auth/me", { cache: "no-store" });
        const data = await res.json().catch(() => null);
        if (active) setUser(res.ok ? (data?.user ?? null) : null);
      } catch {
        if (active) setUser(null);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // While loading, keep a stable-size placeholder to avoid toolbar shift.
  if (user === undefined) {
    return (
      <span
        aria-hidden
        className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-line bg-panel"
      >
        <User className="h-4 w-4 text-ink-soft" strokeWidth={1.75} />
      </span>
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 rounded-sm border border-line bg-panel px-3 py-1.5 text-sm font-bold text-ink transition hover:border-brand hover:text-brand"
      >
        <LogIn className="h-4 w-4" strokeWidth={2} />
        Login
      </Link>
    );
  }

  const initial = (user.username || "?").charAt(0).toUpperCase();

  return (
    <Link
      href="/account"
      aria-label={"Account: " + user.username}
      title={user.username}
      className="inline-flex h-8 w-8 items-center justify-center rounded-sm bg-brand font-display text-sm font-bold text-paper transition hover:opacity-90"
    >
      {initial}
    </Link>
  );
}
