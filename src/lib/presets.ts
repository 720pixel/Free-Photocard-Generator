// Size presets shared by editor, templates and export. Client-safe (no server-only).

export type SizeKey =
  | "1080x1350"
  | "1080x1080"
  | "1080x1920"
  | "1280x720"
  | "1200x675"
  | "1200x1200"
  | "1200x627"
  | "820x312"
  | "1280x1280";

export interface SizePreset {
  key: SizeKey;
  w: number;
  h: number;
  label: string;
  labelBn: string;
  group: string;
}

export const SIZE_PRESETS: SizePreset[] = [
  { key: "1080x1350", w: 1080, h: 1350, label: "Post 4:5", labelBn: "পোস্ট ৪:৫", group: "Social" },
  { key: "1080x1080", w: 1080, h: 1080, label: "Square 1:1", labelBn: "স্কয়ার ১:১", group: "Social" },
  { key: "1080x1920", w: 1080, h: 1920, label: "Story 9:16", labelBn: "স্টোরি ৯:১৬", group: "Social" },
  { key: "1280x720", w: 1280, h: 720, label: "YT Thumbnail", labelBn: "ইউটিউব থাম্বনেইল", group: "Wide" },
  { key: "1200x675", w: 1200, h: 675, label: "X Post", labelBn: "এক্স পোস্ট", group: "Wide" },
  { key: "1200x1200", w: 1200, h: 1200, label: "LinkedIn 1:1", labelBn: "লিংকডইন ১:১", group: "Pro" },
  { key: "1200x627", w: 1200, h: 627, label: "LinkedIn Cover", labelBn: "লিংকডইন কভার", group: "Pro" },
  { key: "820x312", w: 820, h: 312, label: "FB Cover", labelBn: "ফেসবুক কভার", group: "Pro" },
  { key: "1280x1280", w: 1280, h: 1280, label: "Telegram", labelBn: "টেলিগ্রাম", group: "Social" },
];

export const DEFAULT_SIZE: SizeKey = "1080x1350";

export function presetByKey(key: SizeKey): SizePreset {
  return SIZE_PRESETS.find((p) => p.key === key) ?? SIZE_PRESETS[0];
}

export const CUSTOM_MIN = 256;
export const CUSTOM_MAX = 4096;
