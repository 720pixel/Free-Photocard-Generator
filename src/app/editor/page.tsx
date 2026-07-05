import type { Metadata } from "next";
import { EditorApp } from "@/editor/ui/EditorApp";

export const metadata: Metadata = {
  title: "এডিটর",
  description: "বাংলা নিউজ ও অ্যাবস্ট্রাক্ট ফটোকার্ড এডিটর। টেমপ্লেট বাছুন, ছবি ও টেক্সট বদলান, এক্সপোর্ট করুন।",
};

export default async function EditorPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string; saved?: string; size?: string }>;
}) {
  const { template, saved, size } = await searchParams;
  return <EditorApp initialTemplate={template} initialSaved={saved} initialSize={size} />;
}
