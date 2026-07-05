import type { ReactNode } from "react";

// Renders both locales; LocaleToggle's global style hides the inactive one.
// Bengali is primary, so it is the SSR default.
export function T({ bn, en }: { bn: ReactNode; en: ReactNode }) {
  return (
    <>
      <span className="i18n-bn">{bn}</span>
      <span className="i18n-en">{en}</span>
    </>
  );
}
