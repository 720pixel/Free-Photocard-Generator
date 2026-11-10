// Lightweight bn/en dictionary. Bengali is the primary locale.
export type Locale = "bn" | "en";

export const STRINGS = {
  siteName: { bn: "ফ্রি ফটোকার্ড জেনারেটর", en: "Free Photocard Generator" },
  tagline: {
    bn: "৫০+ ফ্রি নিউজ ও সোশ্যাল মিডিয়া টেমপ্লেট",
    en: "50+ Free News and Social Media Templates",
  },
  heroSub: {
    bn: "কোনো ওয়াটারমার্ক নেই, সব কিছু আপনার ব্রাউজারেই",
    en: "No Watermark, Everything in Your Browser",
  },
  startEditor: { bn: "এডিটর খুলুন", en: "Open Editor" },
  browseTemplates: { bn: "টেমপ্লেট দেখুন", en: "Browse Templates" },
  blankCanvas: { bn: "ফাঁকা ক্যানভাস", en: "Blank Canvas" },
  templates: { bn: "টেমপ্লেট", en: "Templates" },
  layers: { bn: "লেয়ার", en: "Layers" },
  text: { bn: "টেক্সট", en: "Text" },
  image: { bn: "ছবি", en: "Image" },
  logo: { bn: "লোগো", en: "Logo" },
  background: { bn: "ব্যাকগ্রাউন্ড", en: "Background" },
  gradient: { bn: "গ্রেডিয়েন্ট", en: "Gradient" },
  export: { bn: "এক্সপোর্ট", en: "Export" },
  download: { bn: "ডাউনলোড", en: "Download" },
  size: { bn: "সাইজ", en: "Size" },
  font: { bn: "ফন্ট", en: "Font" },
  color: { bn: "রং", en: "Color" },
  undo: { bn: "আনডু", en: "Undo" },
  redo: { bn: "রিডু", en: "Redo" },
  addText: { bn: "টেক্সট যোগ করুন", en: "Add text" },
  upload: { bn: "আপলোড", en: "Upload" },
  apply: { bn: "প্রয়োগ", en: "Apply" },
} as const;

export type StringKey = keyof typeof STRINGS;

export function t(key: StringKey, locale: Locale): string {
  return STRINGS[key][locale];
}
