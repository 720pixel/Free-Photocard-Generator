import type { TemplateCategory } from "@/editor/templates";

export function slugifyCategory(cat: string): string {
  return cat.toLowerCase().replace(/\s+/g, "-");
}

export interface CategoryMeta {
  category: TemplateCategory;
  slug: string;
  nameBn: string;
  nameEn: string;
  h1Bn: string;
  h1En: string;
  blurbBn: string;
  blurbEn: string;
}

// Bengali + English display names and short copy per category. Used by the
// gallery chips, the per-category SSG pages and their metadata. The English
// names double as the canonical TemplateCategory enum values. No em dashes.
const RAW: Record<TemplateCategory, { nameBn: string; blurbBn: string; blurbEn: string }> = {
  "Breaking News": {
    nameBn: "ব্রেকিং নিউজ",
    blurbBn: "জরুরি খবরের জন্য বোল্ড ও দ্রুত নজরকাড়া ফটোকার্ড টেমপ্লেট।",
    blurbEn: "Bold, attention grabbing photocard templates for urgent news updates.",
  },
  "TV Channel": {
    nameBn: "টিভি চ্যানেল",
    blurbBn: "সংবাদ চ্যানেলের স্টাইলে সাজানো পেশাদার ফটোকার্ড ডিজাইন।",
    blurbEn: "Professional, channel style photocard designs for news pages.",
  },
  Newspaper: {
    nameBn: "সংবাদপত্র",
    blurbBn: "সংবাদপত্রের ছাঁচে ক্লাসিক ও পরিচ্ছন্ন নিউজ কার্ড টেমপ্লেট।",
    blurbEn: "Classic, clean broadsheet style news card templates.",
  },
  Sports: {
    nameBn: "খেলাধুলা",
    blurbBn: "ম্যাচ, স্কোর ও খেলার আপডেটের জন্য এনার্জেটিক টেমপ্লেট।",
    blurbEn: "Energetic templates for match, score and sports updates.",
  },
  Entertainment: {
    nameBn: "বিনোদন",
    blurbBn: "সিনেমা, সংগীত ও তারকা খবরের জন্য ঝলমলে ফটোকার্ড।",
    blurbEn: "Vibrant photocards for film, music and celebrity news.",
  },
  Religious: {
    nameBn: "ধর্মীয়",
    blurbBn: "শুভেচ্ছা ও ধর্মীয় বার্তার জন্য সুন্দর অলংকৃত ডিজাইন।",
    blurbEn: "Ornate designs for greetings and religious messages.",
  },
  Tribute: {
    nameBn: "শ্রদ্ধাঞ্জলি",
    blurbBn: "স্মরণ ও শ্রদ্ধা জানাতে শান্ত ও মার্জিত টেমপ্লেট।",
    blurbEn: "Respectful, muted templates for tribute and remembrance.",
  },
  Notice: {
    nameBn: "নোটিশ",
    blurbBn: "ঘোষণা, বিজ্ঞপ্তি ও নিয়োগের জন্য পরিষ্কার কাঠামোবদ্ধ কার্ড।",
    blurbEn: "Clear, structured cards for notices and announcements.",
  },
  Quote: {
    nameBn: "উক্তি",
    blurbBn: "উক্তি ও বাণী শেয়ার করার জন্য টাইপোগ্রাফি ফোকাসড ডিজাইন।",
    blurbEn: "Typography focused designs for sharing quotes and sayings.",
  },
  Weather: {
    nameBn: "আবহাওয়া",
    blurbBn: "আবহাওয়ার পূর্বাভাস ও সতর্কবার্তার জন্য পরিষ্কার টেমপ্লেট।",
    blurbEn: "Clean templates for weather forecasts and alerts.",
  },
  Abstract: {
    nameBn: "অ্যাবস্ট্রাক্ট",
    blurbBn: "আধুনিক গ্রেডিয়েন্ট ও জ্যামিতিক আকারের সৃজনশীল টেমপ্লেট।",
    blurbEn: "Creative templates with modern gradients and geometric shapes.",
  },
  Collage: {
    nameBn: "কোলাজ",
    blurbBn: "একাধিক ছবির গ্রিড ও কোলাজ লেআউটের টেমপ্লেট।",
    blurbEn: "Multi photo grid and collage layout templates.",
  },
  General: {
    nameBn: "সাধারণ",
    blurbBn: "যেকোনো সোশ্যাল মিডিয়া পোস্টের জন্য বহুমুখী ফটোকার্ড।",
    blurbEn: "Versatile photocards for any social media post.",
  },
};

export function categoryMeta(cat: TemplateCategory): CategoryMeta {
  const r = RAW[cat];
  return {
    category: cat,
    slug: slugifyCategory(cat),
    nameBn: r.nameBn,
    nameEn: cat,
    h1Bn: `${r.nameBn} ফটোকার্ড টেমপ্লেট`,
    h1En: `${cat} Photocard Templates`,
    blurbBn: r.blurbBn,
    blurbEn: r.blurbEn,
  };
}

export function categoryBySlug(slug: string, categories: TemplateCategory[]): TemplateCategory | undefined {
  return categories.find((c) => slugifyCategory(c) === slug);
}
